import { onMount } from 'solid-js';
import TreeSitter from 'web-tree-sitter';

export default function (props) {

  onMount(async () => {
    await TreeSitter.init();
    const TreeSitterNix = await TreeSitter.Language.load('/tree-sitter-nix.wasm');
    const parser = new TreeSitter();
    parser.setLanguage(TreeSitterNix);

    const sourceCode = 'if true then true else false';
    const tree = parser.parse(sourceCode);
    console.log(tree);
  });

  return <div>see console</div>;
}
