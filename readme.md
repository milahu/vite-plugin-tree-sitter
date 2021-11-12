# vite-plugin-tree-sitter

bundle [tree-sitter](https://github.com/tree-sitter/tree-sitter/tree/master/lib/binding_web) modules
with [vite](https://github.com/vitejs/vite) bundler

this plugin will

* compile tree-sitter modules to `*.wasm` files
* in the vite development server ...
  * serve these `*.wasm` files
  * serve the `tree-sitter.wasm` file

## example

[solidjs](https://github.com/solidjs/solid) framework

```jsx
// TreeSitter.jsx

import { onMount } from 'solid-js';
import TreeSitter from 'web-tree-sitter';

export default function (props) {

  onMount(async () => {
    await TreeSitter.init();
    const TreeSitterNix = await TreeSitter.Language.load('/assets/tree-sitter-nix.wasm');
    const parser = new TreeSitter();
    parser.setLanguage(TreeSitterNix);

    const sourceCode = 'if true then true else false';
    const tree = parser.parse(sourceCode);
    console.log(tree);
  }

  return <div></div>;
}
```

## similar projects

* https://github.com/wolfmcnally/svelte-emscripten
* https://github.com/nshen/vite-plugin-wasm-pack
* https://github.com/lencx/vite-plugin-rsw wasm-pack plugin for Vite
* https://github.com/gliheng/vite-plugin-rust wasm-pack plugin for vite

## related

* https://github.com/tree-sitter/tree-sitter/discussions/1024 Using Tree-Sitter in Browser
