import { defineConfig } from "vite"
// import pluginTreeSitter from "../../mod.ts"
import pluginTreeSitter from "@guyven/vite-plugin-tree-sitter"

export default defineConfig({
	plugins: [pluginTreeSitter(["../../../../github/tree-sitter-sqlite"])],
})
