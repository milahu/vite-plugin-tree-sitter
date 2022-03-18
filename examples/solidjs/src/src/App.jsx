import { onMount } from 'solid-js';
import { createStore } from "solid-js/store";
import { glob as globalStyle } from "solid-styled-components";
import TreeView from 'solidjs-treeview-component';

import TreeSitter from 'web-tree-sitter';
// https://github.com/tree-sitter/tree-sitter/tree/master/lib/binding_web

// TODO better
// like solid blocks? https://github.com/atk/solid-blocks
var className = 'parse-tree';
globalStyle(`
  .${className}.tree-view.root { margin-left: 1px; margin-right: 1px; }
  .${className}.tree-view.root { height: 100%; /* fit to container */; overflow: auto; /* scroll on demand */ }
  .${className}.tree-view { text-align: left; }
  .${className}.tree-view ul,
  .${className}.tree-view { list-style: none; padding: 0; }
  .${className}.tree-view ul { padding-left: 0.75em; margin-left: calc(0.25em - 1px); border-left: solid 1px gray; }
  .${className}.tree-view li { white-space: pre; /* dont wrap on x overflow. TODO fix width on overflow */ }
  .${className}.tree-view div.node-label { font-family: monospace; }
  .${className}.tree-view div.node-label > span.code { color: yellow !important; }
  .${className}.tree-view div.node-label > span.separator { /* opacity: 0.6; */ }
  .${className}.tree-view div.node-label > span.type { /* opacity: 0.8; */ }
  .${className}.tree-view li.branch > ul { display: none; /* default collapsed */ }
  .${className}.tree-view li.branch.expanded {  }
  .${className}.tree-view li.branch.expanded > ul { display: block; }
  .${className}.tree-view div.branch-label > div.node-label > span.separator { color: blue; }
  .${className}.tree-view li.empty { font-style: italic; }
`);

export default function App(props) {

  const [state, setState] = createStore({
    parseTree: {},
    fileSelected: '',
    sourceCode: '',
  });

  onMount(async () => {
    if (false) {
      // fetch tree-sitter.wasm from custom location
      // https://github.com/tree-sitter/tree-sitter/issues/559
      var TreeSitterWasmUrl = "https://somehost.com/path/to/tree-sitter.wasm";
      var TreeSitterWasmUrl = "/path/to/tree-sitter.wasm";
      function patchFetch() {
        const realFetch = window.fetch;
        window.fetch = function fetch() {
          if (arguments[0] == "tree-sitter.wasm") {
            console.log(`fetch: patching URL: ${arguments[0]} -> ${TreeSitterWasmUrl}`);
            arguments[0] = TreeSitterWasmUrl;
          }
          return realFetch.apply(window, arguments);
        };
      }
      patchFetch();
    }

    await TreeSitter.init(); // fetch tree-sitter.wasm

    const TreeSitterNix = await TreeSitter.Language.load('tree-sitter-nix.wasm');

    const parser = new TreeSitter();
    parser.setLanguage(TreeSitterNix);

    setState('sourceCode', 'if true then true else false');
    //console.log('state.sourceCode', state.sourceCode);
    const parseTree = parser.parse(state.sourceCode);
    //console.log('parseTree', parseTree);
    setState('parseTree', parseTree);
  });

  function parseTreeGetters() {
    const get = {};
    get.isLeaf = node => (node.childCount == 0);
    get.name = node => node.type;
    get.path = (node, prefix) => prefix ? `${prefix}/${get.name(node)}` : get.name(node);
    get.childNodes = node => node.children;
    get.emptyLabel = (prefix) => '( empty )';
    get.branchLabel = (node, prefix) => {
      return (
        <div class="node-label">
          <span class="source">{node.text}</span>
          <span class="separator"> {get.isLeaf(node) ? '$' : '+'} </span>
          <span class="type">{node.type}</span>
        </div>
      );
    };
    /*
    get.branchLabel = (node, prefix) => (
      <span class="name">{get.name(node)}</span>
    );
    */
    get.leafLabel = (node, prefix) => {
      return (
        <div class="node-label" onClick={() => setState('fileSelected', get.path(node, prefix))}>
          <span class="source">{node.text}</span>
          <span class="separator"> {get.isLeaf(node) ? '$' : '+'} </span>
          <span class="type">{node.type}</span>
        </div>
      );
    };
    return get;
  }

  function parseTreeFilterGet() {
    function parseTreeFilter(parseTree) {
      return parseTree.rootNode.children;
      /*
      if (parseTree.rootNode) {
        parseTree = parseTree.rootNode;
      }
      */
    }
  }

  return (
    <div>
      <dl>
        <dt>source code</dt>
        <dd>
          <pre>{state.sourceCode}</pre>
          {/*
          <pre contentEditable>{state.sourceCode}</pre>
          */}
        </dd>
        {/*
        <dt>parseTree.rootNode</dt>
        <dd>
          <pre>{() => JSON.stringify(state.parseTree.rootNode, null, 2)}</pre>
        </dd>
        */}
        {/*
        <dt>parseTree.rootNode.children</dt>
        <dd>
          <pre>{() => JSON.stringify(state.parseTree.rootNode?.children, null, 2)}</pre>
        </dd>
        */}
        <dt>parse tree: click the branch nodes (<code>+</code>) to expand/collapse</dt>
        <dd>
          {/* filter={fileListFilter()} */}
          {/* filter={parseTreeFilterGet()} */}
          {/* load={loadFiles} */}
          <TreeView
            data={state.parseTree.rootNode?.children}
            get={parseTreeGetters()}
            className="parse-tree"
          />
        </dd>
      </dl>
    </div>
  );
}
