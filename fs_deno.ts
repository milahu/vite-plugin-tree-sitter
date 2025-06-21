import { basename, join, resolve } from "@std/path"
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
	// FSStreamFileTo,
} from "./types.ts"
// import { toReadableStream, toWritableStream } from "@std/io"
// import type { Writer } from "@std/io/types"

export const fsPathJoin: FSPathJoin = (...paths) => join(...paths)
export const fsFileNameFromPath: FSFileNameFromPath = path => basename(path)
export const fsPathResolve: FSPathResolve = path => resolve(path)
export const fsExecute: FSExecute = async (path, options) => {
	const { args, env, cwd } = options
	const cmd = new Deno.Command(path, { args, env, cwd })
	const decoder = new TextDecoder()
	const output = await cmd.output()
	const result = { success: false, stderr: "", stdout: "" }
	result.success = output.success
	result.stderr = decoder.decode(output.stderr)
	result.stdout = decoder.decode(output.stdout)
	return result
}
export const fsSpawnShell: FSSpawnShell = async (path, options) => {
	const { args, env, cwd } = options
	const command = new Deno.Command(path, {
		args,
		env,
		cwd,
		stdin: "inherit",
		stdout: "inherit",
		stderr: "inherit",
	})
	const { success, code } = await command.spawn().status
	return { success, code }
}
export const fsExists: FSExists = async path => {
	try {
		await Deno.stat(path)
		// if (stat.isFile) {				}
		return true
	} catch (_e) {
		// console.error({ _e })
	}
	return false
}
export const fsReadText: FSReadText = path => Deno.readTextFile(path)
export const fsReadFile: FSReadFile = path => Deno.readFile(path)
export const fsMakeDir: FSMakeDir = (path, options) => Deno.mkdir(path, options)

// export const fsStreamFileTo: FSStreamFileTo = async (path, to) => {
// 	const file = await Deno.open(path, { read: true })
// 	toReadableStream(file).pipeTo(
// 		toWritableStream({
// 			write: a => {
// 				return new Promise(resolve =>
// 					to.write(a, () => {
// 						console.log({ a, len: a.length })
// 						resolve(a.length)
// 					}),
// 				)
// 			},
// 		}),
// 	)
// 	// new ReadableStream(file).pipeTo(to)
// }

// export const fsStreamFileTo: FSStreamFileTo = async (path, to) => {
// 	const f = await Deno.open(path)
// 	await toReadableStream(f).pipeTo(toWritableStream(to))
// 	f.close()
// }
