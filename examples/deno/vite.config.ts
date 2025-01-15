import { defineConfig } from "vite"
// import pluginTreeSitter from "@guyven/vite-plugin-tree-sitter"
import pluginTreeSitter from "../../mod.ts"

export default defineConfig({
	plugins: [
		pluginTreeSitter(["../../../../github/tree-sitter-sqlite"], {
			logLevel: "TRACE",
		}),
	],
})
