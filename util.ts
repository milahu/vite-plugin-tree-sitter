export const pluginName = "vite-plugin-tree-sitter"

export const Defaults: {
	logPrefix: string
	showInfo: boolean
	showDebug: boolean
	showTrace: boolean
} = {
	logPrefix: pluginName,
	showInfo: true,
	showDebug: false,
	showTrace: false,
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
export const trace = (text: string, { extra = "", forceShow = false } = {}) =>
	(forceShow || Defaults.showTrace) &&
	console.debug(
		` %c${Defaults.logPrefix} %cTRACE:%c ${text} %c${extra}`,
		"color: darkgrey",
		"font-weight: bold; color: purple",
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
