import { defineConfig } from "vite"
import pluginTreeSitter from "@guyven/vite-plugin-tree-sitter"

export default defineConfig({
	plugins: [
		pluginTreeSitter(["../../../../github/tree-sitter-sqlite"], {
			// logLevel: "TRACE",
		}),
	],
	// following is required for web-tree-sitter.wasm to appear in dev-mode
	optimizeDeps: { exclude: ["web-tree-sitter"] },
})
