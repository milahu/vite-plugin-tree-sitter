import { defineConfig } from "vite"
import pluginTreeSitter from "@guyven/vite-plugin-tree-sitter"

export default defineConfig({
	plugins: [pluginTreeSitter(["tree-sitter-sqlite"])],
})
