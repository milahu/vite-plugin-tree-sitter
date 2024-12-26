# vite-plugin-tree-sitter

This plugin for [vite](https://github.com/vitejs/vite) streamlines the process of
developing and bundling a [tree-sitter](https://github.com/tree-sitter/tree-sitter/tree/master/lib/binding_web)
grammar in your project.

- `0.2.4` 2024-12-26 : added fs method descriminators
  - currently supporting `deno` and `node`
  - added TRACE log level for better narrowing of issues
- `0.2.3` 2024-12-25 : replaced most node behaviors with native `deno`
- `0.2.2` 2024-12-25 : added support for legacy grammar definitions
  - attempt is made to upgrade a grammar before giving up
  - added `pnpm` example usage
- `0.2.1` 2024-12-24 : cleanup for `jsr` publish
  - added `deno` example
  - corrected error with detection of `tree-sitter-cli` tool location
  - added type documentation
- `0.2.0` 2024-12-24 : major refactor
  - use `tree-sitter-cli` instead of replicating it's behavior locally
  - project converted to `deno`
- `0.1.3` 2024-11-10 : updated `emcc` flags in compilation step
  - added option to set build cache location
  - added option to set serve cache location
- `0.1.2` 2024-11-07 : corrected behavior in `vite` 5
- `0.1.1` 2024-11-06 : corrected path handling for non-package grammars
- `0.1.0` 2023-07-09 : added output caching
  - support grammars without a `scanner` component
- `0.0.1` 2022-06-11 : initial release

## Operation

You may either add the `tree-sitter-cli` tool to your project as a package dependency
or have it installed locally and included on the PATH. This plugin will detect
either scenario. You can then include some tree-sitter grammar as a package
dependency or add it locally in a relative folder (in or outside of your project).

As a part of the `vite` rollup lifecycle, your grammar will be compiled using
`tree-sitter-cli` and served automatically by your development server.

When bundling for production the generated `wasm` files are included in the distribution.

## Configuration

```javascript
// your project's vite.config.ts file

import { defineConfig } from "vite"
import pluginTreeSitter from "vite-plugin-tree-sitter"

export default defineConfig({
 plugins: [
  pluginTreeSitter(["../../github/tree-sitter-sqlite/"], {
   alwaysRebuild: false, // whether to rebuild wasm on every vite build cycle
   emBuildCacheDir: null, // override for emcc build process location, may be required due to write permissions
   wasmCacheDir: ".grammar", // location for output of wasm build process (used during vite serve for caching)
   logLevel: "INFO", // DEBUG | INFO | ERROR
  }),
 ],
})
```

## Example

[solidjs](https://github.com/solidjs/solid) framework,
based on [solidjs template](https://github.com/solidjs/templates/tree/master/js)

see [examples/solidjs/](examples/solidjs/)

## External References

### Similar projects

- <https://github.com/Menci/monaco-tree-sitter>
  - monaco editor + tree-sitter parser ([via](https://github.com/EvgeniyPeshkov/syntax-highlighter/issues/46))
  - fork: <https://github.com/milahu/monaco-tree-sitter>
- <https://github.com/wolfmcnally/svelte-emscripten>
- <https://github.com/nshen/vite-plugin-wasm-pack>
- <https://github.com/lencx/vite-plugin-rsw> wasm-pack plugin for Vite
- <https://github.com/gliheng/vite-plugin-rust> wasm-pack plugin for vite

### Related

- <https://github.com/tree-sitter/tree-sitter/discussions/1024> Using Tree-Sitter in Browser
  - <https://tree-sitter.github.io/tree-sitter/playground>
  - <https://github.com/tree-sitter/tree-sitter/blob/master/docs/section-7-playground.html>
  - <https://github.com/tree-sitter/tree-sitter/blob/master/docs/assets/js/playground.js>
- <https://github.com/lezer-parser/lr> lezer incremental parser, used by codemirror
  - <https://discuss.codemirror.net/t/mapping-tree-sitter-trees-to-lezer-trees/2362>
  - <https://discuss.codemirror.net/t/performance-vs-tree-sitter-for-non-web-based-use/3317>
