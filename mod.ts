import type { PluginOption } from "vite"

import ora from "ora"
import {
	debug,
	error,
	fsExecute,
	fsExists,
	info,
	pluginName,
	Defaults as util_defaults,
} from "./util.ts"
import { createReadStream } from "node:fs"
import { join as pathJoin, basename } from "node:path"
import { mkdir, readFile } from "node:fs/promises"

async function identifyCLI() {
	for (const tsPath of [
		pathJoin("node_modules", ".bin", "tree-sitter"),
		"tree-sitter",
	]) {
		const cmdExe = await fsExecute(tsPath, { args: ["--version"] })
		if (cmdExe.success) return tsPath
	}
	error("Unable to find 'tree-sitter' cli", {
		extra:
			"Make sure to provide this on your PATH or add the npm 'tree-sitter-cli' package to this project",
	})
}

/**
 * Plugin for controlling the building and bundling of tree-sitter grammars
 */
export default function (
	/** path(s) to grammars to include */
	parsers: [string, ...string[]],
	options: Partial<{
		/** If false, only rebuild when grammar is missing, if true always rebuild, default = false */
		alwaysRebuild: boolean
		/** Specify directory for wasm output files, default = .grammar */
		wasmCacheDir: string
		/** Override for `emcc` tool's cache directory. May be useful if write permissions interfere */
		emBuildCacheDir: string
		/** Detail level of messages emitted at runtime, default = INFO */
		logLevel: "DEBUG" | "INFO" | "ERROR"
	}> = {},
): PluginOption {
	// console.log({ cwd: Deno.cwd(), parsers, options })
	if (!Array.isArray(parsers) || typeof parsers[0] != "string") {
		throw new Error(
			"argument 'parsers' required and must be an array of strings",
		)
	}
	const wasmCacheDir = options.wasmCacheDir || ".grammar"

	if (options.logLevel == "DEBUG") {
		util_defaults.showDebug = true
		util_defaults.showInfo = true
	} else if (options.logLevel == "ERROR") {
		util_defaults.showDebug = false
		util_defaults.showInfo = false
	}

	const wasmServeList = new Map()
	wasmServeList.set(
		"/tree-sitter.wasm",
		pathJoin("node_modules", "web-tree-sitter", "tree-sitter.wasm"),
	)

	let runMode: "DEV" | "PROD" | null = null

	return {
		name: pluginName,
		version: "0.2.0",
		apply: ({ mode }) => {
			runMode =
				mode == "development" ? "DEV" : mode == "production" ? "PROD" : null
			return true
		},
		async buildStart(_inputOptions: unknown) {
			// console.log(_inputOptions)

			const ts = await identifyCLI()
			if (!ts) return

			const grammars = new Map()
			for (const parser of parsers) {
				const err = (t: string) => error(t, { extra: parser })
				const isPkg = !(
					parser.startsWith("./") ||
					parser.startsWith("../") ||
					parser.startsWith("/")
				)
				const grammar_base_path = pathJoin(isPkg ? "node_modules" : "", parser)
				const grammar_path = pathJoin(grammar_base_path, "tree-sitter.json")

				if (!(await fsExists(grammar_path))) {
					const pkgJsonPath = pathJoin(grammar_base_path, "package.json")
					if (!(await fsExists(pkgJsonPath))) {
						err("Unable to find 'tree-sitter.json' or 'package.json'")
						continue
					}
					if (
						!("tree-sitter" in JSON.parse(await readFile(pkgJsonPath, "utf8")))
					) {
						err(
							"Unable to find 'tree-sitter.json' or 'tree-sitter' section of 'package.json'",
						)
						continue
					}
					info(
						"'tree-sitter.json' missing, attempting to upgrade target grammar",
						{ extra: grammar_base_path },
					)
					const { success, stderr } = await fsExecute(ts, {
						args: ["init", "--update"],
						cwd: grammar_base_path,
					})

					if (!success) {
						error("Tool Output", { extra: stderr })
					}
					if (!(await fsExists(grammar_path))) {
						err("Failed to upgrade grammar, will not include in bundle")
						continue
					}
				}

				try {
					const parser_name = JSON.parse(await readFile(grammar_path, "utf8"))
						.grammars[0].name
					grammars.set(parser_name, parser)
				} catch (_e) {
					// console.error({ _e })
					err("Unable to parse the grammar definition")
				}
			}

			try {
				await mkdir(wasmCacheDir, { recursive: true })
			} catch (_e) {
				// already exists, but that's fine
				error(JSON.stringify(_e))
			}

			for (const [gName, gPath] of grammars) {
				const outWasm = `tree-sitter-${gName}.wasm`
				const outWasmPath = pathJoin(wasmCacheDir, outWasm)
				wasmServeList.set("/" + outWasm, outWasmPath)

				const spinner = ora({
					indent: 2,
					color: "blue",
					text: `${pluginName} : ${gName} : Building`,
				})

				if (!options.alwaysRebuild) {
					if (await fsExists(outWasmPath)) {
						spinner.succeed(`${pluginName} : ${gName} : Cached`)
						continue
					}
				}

				spinner.start()

				const exeResult = await fsExecute(ts, {
					args: ["build", "--wasm", "--output", outWasmPath, gPath],
					env: options.wasmCacheDir
						? { EM_CACHE: options.wasmCacheDir }
						: undefined,
				})

				const { success, stderr } = exeResult
				if (success) {
					spinner.succeed(`${pluginName} : ${gName} : Built`)
				} else {
					spinner.fail(`${pluginName} : ${gName} : Build failed`)
					error("Tool output", { extra: stderr })
				}
			}

			if (runMode == "PROD") {
				for (const [wname, wpath] of wasmServeList) {
					const wasmContent = await readFile(wpath)
					this.emitFile({
						type: "asset",
						fileName: basename(wname),
						source: wasmContent,
					})
				}
			}
		},
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				if (req.url) {
					debug("query", { extra: req.url })
					const wasm = wasmServeList.get(req.url)
					if (wasm) {
						info("wasm serve", { extra: wasm })
						res.writeHead(200, { "Content-Type": "application/wasm" })
						createReadStream(wasm).pipe(res)
					} else {
						next()
					}
				}
			})
		},
	}
}
