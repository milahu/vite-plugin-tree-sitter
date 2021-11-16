# vite-plugin-tree-sitter

bundle [tree-sitter](https://github.com/tree-sitter/tree-sitter/tree/master/lib/binding_web) modules
with [vite](https://github.com/vitejs/vite) bundler

this plugin will

* compile tree-sitter modules to `*.wasm` files
* in the vite development server ...
  * serve these `*.wasm` files
  * serve the `tree-sitter.wasm` file

## example

[solidjs](https://github.com/solidjs/solid) framework,
based on [solidjs template](https://github.com/solidjs/templates/tree/master/js)

see [examples/solidjs/](examples/solidjs/)

## similar projects

* https://github.com/Menci/monaco-tree-sitter monaco editor + tree-sitter parser ([via](https://github.com/EvgeniyPeshkov/syntax-highlighter/issues/46))
* https://github.com/wolfmcnally/svelte-emscripten
* https://github.com/nshen/vite-plugin-wasm-pack
* https://github.com/lencx/vite-plugin-rsw wasm-pack plugin for Vite
* https://github.com/gliheng/vite-plugin-rust wasm-pack plugin for vite

## related

* https://github.com/tree-sitter/tree-sitter/discussions/1024 Using Tree-Sitter in Browser
  * https://tree-sitter.github.io/tree-sitter/playground
  * https://github.com/tree-sitter/tree-sitter/blob/master/docs/section-7-playground.html
  * https://github.com/tree-sitter/tree-sitter/blob/master/docs/assets/js/playground.js
* https://github.com/lezer-parser/lr lezer incremental parser, used by codemirror
  * https://discuss.codemirror.net/t/mapping-tree-sitter-trees-to-lezer-trees/2362
  * https://discuss.codemirror.net/t/performance-vs-tree-sitter-for-non-web-based-use/3317
