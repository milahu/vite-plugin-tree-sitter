import * as path from "@std/path"
import Kia from "@fathym/kia"
import type { PluginOption } from "vite"

const pluginName = "vite-plugin-test1"

const _wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const error = (text: string, { extra = "" } = {}) =>
	console.error(
		`${pluginName} %cERROR:%c ${text} %c${extra}`,
		"font-weight: bold; color: red",
		"font-weight: reset; color: reset",
		"color: grey",
	)

async function identifyCLI() {
	for (const tsPath of [
		path.join("node_modules", ".bin", "tree-sitter"),
		"tree-sitter",
	]) {
		try {
			const cmd = new Deno.Command(tsPath, { args: ["--version"] })
			const out = await cmd.output()
			if (out.success) return tsPath
		} catch (_e) {
			// console.error({ _e })
		}
	}
	error("Unable to find 'tree-sitter' cli", {
		extra:
			"Make sure to provide this on your PATH or add the npm 'tree-sitter-cli' package to this project",
	})
}

export default function (
	parsers: [string, ...string[]],
	options?: Partial<{
		alwaysRebuild: boolean
		wasmCacheDir: string
		emBuildCacheDir: string
	}>,
): PluginOption {
	// console.log({ cwd: Deno.cwd(), parsers, options })
	if (!Array.isArray(parsers) || typeof parsers[0] != "string") {
		throw new Error(
			"argument 'parsers' required and must be an array of strings",
		)
	}
	if (!options) options = {}
	const wasmCacheDir = options.wasmCacheDir || ".grammar"

	console.log("test2")
	return {
		name: pluginName,
		version: "0.2.0",
		async buildStart(_inputOptions: unknown) {
			const ts = await identifyCLI()
			if (!ts) return

			const grammars = new Map()
			for (const parser of parsers) {
				const err = (t: string) => error(t, { extra: parser })
				const grammar_path = path.join(parser, "tree-sitter.json")
				try {
					const stat = await Deno.stat(grammar_path)
					if (stat.isFile) {
						try {
							const parser_name = JSON.parse(
								await Deno.readTextFile(grammar_path),
							).grammars[0].name
							grammars.set(parser_name, parser)
						} catch (_e) {
							// console.error({ _e })
							err("unable to parse the grammar definition")
						}
					}
				} catch (_e) {
					// console.error({ _e })
					err("Unable to find 'tree-sitter.json'")
				}
			}

			// console.log({ grammars })

			try {
				await Deno.mkdir(wasmCacheDir, { recursive: true })
			} catch (_e) {
				// already exists, but that's fine
				error(JSON.stringify(_e))
			}

			// deno run -A npm:tree-sitter-cli build --wasm --output ./test1.wasm ../../github/tree-sitter-sqlite

			for (const [gName, gPath] of grammars) {
				const outWasm = `tree-sitter-${gName}.wasm`
				const outWasmPath = path.join(wasmCacheDir, outWasm)

				const k = new Kia({
					color: "blue",
					indent: 2,
					text: `${pluginName} : ${gName} : Building`,
				})

				if (!options.alwaysRebuild) {
					try {
						const stat = await Deno.stat(outWasmPath)
						if (stat.isFile) {
							k.succeed(`${pluginName} : ${gName} : Cached`)
							continue
						}
					} catch {
						// didn't exist, so we rebuild
					}
				}

				k.start()

				const cmd = new Deno.Command(ts, {
					args: ["build", "--wasm", "--output", outWasmPath, gPath],
					env: options.wasmCacheDir
						? { EM_CACHE: options.wasmCacheDir }
						: undefined,
				})

				const { success, stderr } = await cmd.output()
				const decoder = new TextDecoder()
				if (success) {
					k.succeed(`${pluginName} : ${gName} : Built`)
				} else {
					k.fail(`${pluginName} : ${gName} : Build failed`)
					console.error(decoder.decode(stderr))
				}
			}
		},
	}
}

// in the cache there should be two folders
// one for the emcc worker
// and one for the output files
// they shoudl be copied to the build
// or built if they dont' exist
