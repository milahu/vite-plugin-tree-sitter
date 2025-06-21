import { spawn } from "node:child_process"
import { basename, join, resolve } from "node:path"
import { mkdir, readFile, stat } from "node:fs/promises"
import { createReadStream } from "node:fs"
import type {
	FSExecute,
	FSExists,
	FSFileNameFromPath,
	FSMakeDir,
	FSPathJoin,
	FSPathResolve,
	FSReadFile,
	FSReadText,
	FSSpawnShell,
	FSStreamFileTo,
} from "./types.ts"

export const fsPathJoin: FSPathJoin = (...paths) => join(...paths)
export const fsFileNameFromPath: FSFileNameFromPath = path => basename(path)
export const fsPathResolve: FSPathResolve = path => resolve(path)
export const fsExecute: FSExecute = (path, options = {}) => {
	const { args, env, cwd } = options
	const cmd = spawn(path, args, { env, cwd })
	const decoder = new TextDecoder()
	const result = { success: false, stderr: "", stdout: "" }
	cmd.stdout?.on("data", data => (result.stdout = decoder.decode(data)))
	cmd.stderr?.on("data", data => (result.stderr = decoder.decode(data)))
	return new Promise(resolve => {
		cmd.on("error", (_err: Error) => {
			result.success = false
			// TODO include error in result
			// console.error(_err)
			resolve(result)
		})
		cmd.on("close", (code: number) => {
			result.success = code == 0
			resolve(result)
		})
	})
}
export const fsSpawnShell: FSSpawnShell = (path, options = {}) => {
	const { args, env, cwd } = options
	const cmd = spawn(path, args as readonly string[], {
		env,
		cwd,
		stdio: "inherit",
	})

	return new Promise((resolve, _reject) => {
		cmd.on("error", (_err: Error) => {
			resolve({ success: false, code: 0 })
		})
		cmd.on("close", (code: number) => {
			resolve({ success: code == 0, code })
		})
	})
}
export const fsExists: FSExists = async path => {
	try {
		await stat(path)
		return true
	} catch (_e) {
		// console.error({ _e })
	}
	return false
}
export const fsReadText: FSReadText = path => readFile(path, "utf8")
export const fsReadFile: FSReadFile = path => readFile(path)
export const fsMakeDir: FSMakeDir = async (path, options = {}) => {
	await mkdir(path, options)
}
export const fsStreamFileTo: FSStreamFileTo = (path, to) =>
	createReadStream(path).pipe(to)
