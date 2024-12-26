import { stat } from "node:fs/promises"
import { spawn } from "node:child_process"
import { join as pathJoin } from "node:path"

export const pluginName = "vite-plugin-tree-sitter"

export const Defaults: {
	logPrefix: string
	showInfo: boolean
	showDebug: boolean
} = {
	logPrefix: pluginName,
	showInfo: true,
	showDebug: false,
}

export const info = (text: string, { extra = "", forceShow = false } = {}) =>
	(forceShow || Defaults.showInfo) &&
	console.error(
		` %c${Defaults.logPrefix} %cINFO:%c ${text} %c${extra}`,
		"color: darkgrey",
		"font-weight: bold; color: yellow",
		"font-weight: reset; color: reset",
		"color: grey",
	)
export const debug = (text: string, { extra = "", forceShow = false } = {}) =>
	(forceShow || Defaults.showDebug) &&
	console.debug(
		` %c${Defaults.logPrefix} %cDEBUG:%c ${text} %c${extra}`,
		"color: darkgrey",
		"font-weight: bold; color: blue",
		"font-weight: reset; color: reset",
		"color: grey",
	)
export const error = (text: string, { extra = "" } = {}) =>
	console.error(
		` %c${Defaults.logPrefix} %cERROR:%c ${text} %c${extra}`,
		"color: darkgrey",
		"font-weight: bold; color: red",
		"font-weight: reset; color: reset",
		"color: grey",
	)

export const fsExecute = (
	path: string,
	options: Partial<{
		args: string[]
		env: Record<string, string>
		cwd: string
	}> = {},
): Promise<{ success: boolean; stdout: string; stderr: string }> => {
	path = Array.isArray(path) ? pathJoin(...path) : path
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
export const fsExists = async (path: string): Promise<boolean> => {
	path = Array.isArray(path) ? pathJoin(...path) : path
	try {
		await stat(path)
		return true
	} catch (_e) {
		// console.error({ _e })
	}
	return false
}
