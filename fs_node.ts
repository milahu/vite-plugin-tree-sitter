import { spawn } from "node:child_process"
import { basename, join } from "node:path"
import { mkdir, readFile, stat } from "node:fs/promises"
import { createReadStream } from "node:fs"
import type {
	FSExecute,
	FSExists,
	FSFileNameFromPath,
	FSMakeDir,
	FSPathJoin,
	FSReadText,
	FSStreamFileTo,
} from "./types.ts"

export const fsPathJoin: FSPathJoin = (...paths) => join(...paths)
export const fsFileNameFromPath: FSFileNameFromPath = path => basename(path)
export const fsExecute: FSExecute = (path, options = {}) => {
	path = Array.isArray(path) ? fsPathJoin(...path) : path
	const { args, env, cwd } = options
	const cmd = spawn(path, args, { env, cwd })
	const result = { success: false, stderr: "", stdout: "" }
	cmd.stdout?.on("data", data => (result.stdout = data))
	cmd.stderr?.on("data", data => (result.stderr = data))
	return new Promise(resolve => {
		cmd.on("error", _err => {
			result.success = false
			// TODO include error in result
			// console.error(_err)
			resolve(result)
		})
		cmd.on("close", code => {
			result.success = code == 0
			resolve(result)
		})
	})
}
export const fsExists: FSExists = async path => {
	path = Array.isArray(path) ? fsPathJoin(...path) : path
	try {
		await stat(path)
		return true
	} catch (_e) {
		// console.error({ _e })
	}
	return false
}
export const fsReadText: FSReadText = path => {
	path = Array.isArray(path) ? fsPathJoin(...path) : path
	return readFile(path, "utf8")
}
export const fsMakeDir: FSMakeDir = async (path, options = {}) => {
	await mkdir(path, options)
}
export const fsStreamFileTo: FSStreamFileTo = (path, to) =>
	createReadStream(path).pipe(to)
