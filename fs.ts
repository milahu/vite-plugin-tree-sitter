import { debug, error, trace } from "./util.ts"
import type {
	FSExecute,
	FSExists,
	FSFileNameFromPath,
	FSPathResolve,
	FSMakeDir,
	FSPathJoin,
	FSReadText,
	FSStreamFileTo,
	FSReadFile,
	FSSpawnShell,
} from "./types.ts"
import {
	fsPathJoin as deno_PathJoin,
	fsFileNameFromPath as deno_FileNameFromPath,
	fsPathResolve as deno_PathResolve,
	fsExecute as deno_Execute,
	fsExists as deno_Exists,
	fsReadText as deno_ReadText,
	fsReadFile as deno_ReadFile,
	fsMakeDir as deno_MakeDir,
	fsSpawnShell as deno_SpawnShell,
	// fsStreamFileTo as deno_StreamFileTo,
} from "./fs_deno.ts"
import {
	fsPathJoin as node_PathJoin,
	fsFileNameFromPath as node_FileNameFromPath,
	fsPathResolve as node_PathResolve,
	fsExecute as node_Execute,
	fsExists as node_Exists,
	fsReadText as node_ReadText,
	fsReadFile as node_ReadFile,
	fsMakeDir as node_MakeDir,
	fsSpawnShell as node_SpawnShell,
	fsStreamFileTo as node_StreamFileTo,
} from "./fs_node.ts"

export const Defaults: {
	forceRuntime?: Runtime
} = {
	forceRuntime: undefined,
}

export enum Runtime {
	Deno,
	Node,
	Bun,
	CloudflareWorkers,
	unknown,
}
export const getRuntime = () => {
	if (Defaults.forceRuntime) {
		debug("getRuntime", {
			extra: `${Runtime[Defaults.forceRuntime]} (forced)`,
		})
		return Defaults.forceRuntime
	}
	const ua = navigator.userAgent
	const runtime =
		ua.startsWith("Deno") ? Runtime.Deno
		: ua.startsWith("Node.js") ? Runtime.Node
		: ua.startsWith("Bun") ? Runtime.Bun
		: ua.startsWith("Cloudflare-Workers") ? Runtime.CloudflareWorkers
		: Runtime.unknown
	// console.log("runtime=", Runtime[runtime], ua)
	trace("getRuntime", { extra: `${Runtime[runtime]} (detected)` })
	return runtime
}

export const fsPathJoin: FSPathJoin = (...paths) => {
	trace("fsPathJoin", { extra: JSON.stringify({ paths }) })
	let result = ""
	switch (getRuntime()) {
		case Runtime.Deno:
			result = deno_PathJoin(...paths)
			break
		case Runtime.Node:
			result = node_PathJoin(...paths)
			break
		default:
			error("Unable to produce a path in this environment")
	}
	trace("fsPathJoin", { extra: JSON.stringify({ result }) })
	return result
}

export const fsFileNameFromPath: FSFileNameFromPath = path => {
	trace("fsFileNameFromPath", { extra: JSON.stringify({ path }) })
	let result = ""
	switch (getRuntime()) {
		case Runtime.Deno:
			result = deno_FileNameFromPath(path)
			break
		case Runtime.Node:
			result = node_FileNameFromPath(path)
			break
		default:
			error("Unable to parse path in this environment")
	}
	trace("fsFileNameFromPath", { extra: JSON.stringify({ result }) })
	return result
}

export const fsPathResolve: FSPathResolve = path => {
	trace("fsPathResolve", { extra: JSON.stringify({ path }) })
	let result = ""
	switch (getRuntime()) {
		case Runtime.Deno:
			result = deno_PathResolve(path)
			break
		case Runtime.Node:
			result = node_PathResolve(path)
			break
		default:
			error("Unable to resolve path in this environment")
	}
	trace("fsPathResolve", { extra: JSON.stringify({ result }) })
	return result
}

export const fsExecute: FSExecute = async (path, options) => {
	trace("fsExecute", { extra: JSON.stringify({ path, options }) })
	let result = { success: false, stdout: "", stderr: "" }
	switch (getRuntime()) {
		case Runtime.Deno:
			result = await deno_Execute(path, options)
			break
		case Runtime.Node:
			result = await node_Execute(path, options)
			break
		default:
			error("Unable to execute external process in this environment")
	}
	trace("fsExecute", { extra: JSON.stringify({ result }) })
	return result
}

export const fsSpawnShell: FSSpawnShell = async (path, options) => {
	trace("fsSpawnShell", { extra: JSON.stringify({ path, options }) })
	let result = { success: false, code: 0 }
	switch (getRuntime()) {
		case Runtime.Deno:
			result = await deno_SpawnShell(path, options)
			break
		case Runtime.Node:
			result = await node_SpawnShell(path, options)
			break
		default:
			error("Unable to spawn shell in this environment")
	}
	trace("fsSpawnShell", { extra: JSON.stringify({ result }) })
	return result
}

export const fsExists: FSExists = async path => {
	trace("fsExists", { extra: JSON.stringify({ path }) })
	let result = false
	switch (getRuntime()) {
		case Runtime.Deno:
			result = await deno_Exists(path)
			break
		case Runtime.Node:
			result = await node_Exists(path)
			break
		default:
			error("Unable to check filesystem in this environment")
	}
	trace("fsExists", { extra: JSON.stringify({ result }) })
	return result
}

export const fsReadText: FSReadText = async path => {
	trace("fsReadText", { extra: JSON.stringify({ path }) })
	let result = ""
	switch (getRuntime()) {
		case Runtime.Deno:
			result = await deno_ReadText(path)
			break
		case Runtime.Node:
			result = await node_ReadText(path)
			break
		default:
			error("Unable to read external file in this environment")
	}
	trace("fsReadText", { extra: JSON.stringify({ result }) })
	return result
}

export const fsReadFile: FSReadFile = async path => {
	trace("fsReadFile", { extra: JSON.stringify({ path }) })
	let result: Uint8Array<ArrayBufferLike> = new Uint8Array()
	switch (getRuntime()) {
		case Runtime.Deno:
			result = await deno_ReadFile(path)
			break
		case Runtime.Node:
			result = await node_ReadFile(path)
			break
		default:
			error("Unable to read external file in this environment")
	}
	trace("fsReadFile", { extra: JSON.stringify({ bytesRead: result.length }) })
	return result
}

export const fsMakeDir: FSMakeDir = (path, options) => {
	trace("fsMakeDir", { extra: JSON.stringify({ path, options }) })
	switch (getRuntime()) {
		case Runtime.Deno:
			return deno_MakeDir(path, options)
		case Runtime.Node:
			return node_MakeDir(path, options)
		default:
			error("Unable to read external file in this environment")
	}
	return Promise.resolve()
}

export const fsStreamFileTo: FSStreamFileTo = (path, to) => {
	trace("fsStreamFileTo", { extra: JSON.stringify({ path, to }) })
	switch (getRuntime()) {
		case Runtime.Deno:
			//return deno_StreamFileTo(path, to)
			debug("fsStreamFileTo", {
				extra: "Deno stubbed, using Node implementation",
			})
			return node_StreamFileTo(path, to)
		case Runtime.Node:
			return node_StreamFileTo(path, to)
		default:
			error("Unable to read external file in this environment")
	}
}
