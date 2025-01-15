export type FSPathJoin = (...paths: string[]) => string
export type FSFileNameFromPath = (path: string) => string
export type FSPathResolve = (path: string) => string
export type FSExecute = (
	path: string,
	options: Partial<{
		args: string[]
		env: Record<string, string>
		cwd: string
	}>,
) => Promise<{ success: boolean; stdout: string; stderr: string }>
export type FSExists = (path: string) => Promise<boolean>
export type FSReadText = (path: string) => Promise<string>
export type FSReadFile = (path: string) => Promise<Uint8Array>
export type FSMakeDir = (
	path: string,
	options: Partial<{ recursive: boolean }>,
) => Promise<void>
export type FSStreamFileTo = (path: string, to: NodeJS.WritableStream) => void
