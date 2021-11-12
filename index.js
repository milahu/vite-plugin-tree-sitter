/*

vite-plugin-treesitter

based on
https://github.com/nshen/vite-plugin-treesitter/blob/main/src/index.ts
https://github.com/tree-sitter/tree-sitter/blob/master/cli/src/wasm.rs

*/

import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

import child_process from 'child_process';

/*
vite.config.js

import treeSitterPlugin from 'vite-plugin-tree-sitter';

  // only use local crate
  plugins: [
    treeSitterPlugin({ local: ['./my-local-crate'] }),
  ],

  // only use npm crate, leave the first param to an empty array
  plugins: [
    treeSitterPlugin({ npm: ['test-npm-crate'] }),
  ],

  // use both local and npm crate
  plugins: [
    treeSitterPlugin({ local: ['./my-local-crate'], npm: ['test-npm-crate'] }),
  ],
*/

const pluginName = 'vite-plugin-treesitter';

export default function (packages, options) {

  // parse arguments
  if (!packages) packages = [];
  if (!options) options = {};

  // TODO refactor ...
  const localPathList = packages.filter(path => path.startsWith('./'));
  const npmPathList = packages.filter(path => !path.startsWith('./'));

  const prefix = `@${pluginName}@`;
  const wasmPackOutputPath = 'pkg'; // TODO

  // from ../../my-crate  ->  my_crate_bg.wasm
  const wasmNameOfPath = (localPath) => {
    return path.basename(localPath).replace(/\-/g, '_') + '_bg.wasm'; // TODO why _bg ?
  };

  // filename -> { path, isNodeModule }
  // TODO filename collisions?
  const wasmMap = new Map();

  // TODO better?
  // at least make sure that path exists
  wasmMap.set(
    'tree-sitter.wasm',
    {
      path: 'node_modules/web-tree-sitter/tree-sitter.wasm',
      isNodeModule: true
    }
  );

  // 'my_crate_bg.wasm': {path:'../../my_crate/pkg/my_crate_bg.wasm', isNodeModule: false}
  localPathList.forEach((localPath) => {
    const wasmName = wasmNameOfPath(localPath);
    const wasm = {
      path: path.join(localPath, wasmPackOutputPath, wasmName),
      isNodeModule: false
    };
    wasmMap.set(wasmName, wasm);
  });

  // 'my_crate_bg.wasm': { path: 'node_modules/my_crate/my_crate_bg.wasm', isNodeModule: true }
  npmPathList.forEach((npmPath) => {
    const wasmName = wasmNameOfPath(npmPath);
    const wasm = {
      path: path.join('node_modules', npmPath, wasmName),
      isNodeModule: true
    };
    wasmMap.set(wasmName, wasm);
  });

  let config_base;
  let config_assetsDir;



  return { // plugin object

    name: pluginName,
    enforce: 'pre',

    configResolved(resolvedConfig) {
      config_base = resolvedConfig.base;
      config_assetsDir = resolvedConfig.build.assetsDir;
    },

    resolveId(id) {
      //console.log(`${pluginName}: resolveId? ${id}`)
      if (id.includes('.wasm')) {
        console.log(`${pluginName}: resolveId? ${id}`);
      }
      for (let i = 0; i < localPathList.length; i++) {
        if (path.basename(localPathList[i]) === id) {
          console.log(`${pluginName}: resolveId! ${id}`)
          return prefix + id;
        }
      }
      return null;
    },

    async load(id) {
      //console.log(`${pluginName}: load? ${id}`)
      if (id.includes('.wasm')) {
        console.log(`${pluginName}: load? ${id}`)
      }
      if (id.startsWith(prefix)) {
        console.log(`${pluginName}: load! ${id}`)
        id = id.slice(prefix.length);
        const modulejs = path.join(
          './node_modules',
          id,
          id.replace(/\-/g, '_') + '.js'
        );
        console.log(`${pluginName}: load: read code from ${modulejs}`)
        const code = await fs.promises.readFile(modulejs, {
          encoding: 'utf8'
        });
        return code;
      }
    },

    async buildStart(_inputOptions) {
      async function prepareBuild(pkgPath, isNodeModule) {
        const pkgPathFull = isNodeModule
          ? path.join('node_modules', pkgPath)
          : path.join(pkgPath, pkg);
        const pkgName = path.basename(pkgPath);
        if (!fs.existsSync(pkgPathFull)) {
          if (isNodeModule) {
            console.error(`${pluginName}: cannot find npm module ${pkgPathFull}`);
          } else {
            console.error(`${pluginName}: cannot find local module ${pkgPathFull}`);
          }
        }
        if (!isNodeModule) {
          // copy pkg generated by treesitter to node_modules
          try {
            await fs.copy(pkgPath, path.join('node_modules', pkgName));
          } catch (error) {
            this.error(`copy crates failed`);
          }
        }

        // compile if necessary
        const grammar_name = (pkgName.match(/^tree-sitter-(.+)$/) || [])[1];
        if (!grammar_name) {
          console.error(`${pluginName}: cannot parse tree-sitter grammar_name from pkgName ${pkgName}`);
        }
        //const outDir = 'dist/assets';
        const outDir = 'node_modules/.vite'; // TODO handle read-only node_modules
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }
        const outBasePath = `${outDir}/tree-sitter-${grammar_name}`;
        //const outJsPath = `${outBasePath}.js`;
        const outWasmPath = `${outBasePath}.wasm`;

        // based on https://github.com/tree-sitter/tree-sitter/blob/master/cli/src/wasm.rs
        const compileArgs = [
          'emcc',
          '-v', // verbose
          '-Os',
          '-fno-exceptions',
          '-s', 'WASM=1',
          '-s', 'SIDE_MODULE=1', // produce only *.wasm file -> is only a "side module" for other *.wasm file
          '-s', 'TOTAL_MEMORY=33554432',
          '-s', 'NODEJS_CATCH_EXIT=0',
          '-s', `EXPORTED_FUNCTIONS=["_tree_sitter_${grammar_name}"]`,
          '-s', 'ASSERTIONS=1', // debug loading errors
          //'-o', outJsPath, // passing *.js will produce *.js and *.wasm files
          '-o', outWasmPath, // passing *.js will produce *.js and *.wasm files
          '-I', `${pkgPathFull}/src`,
          `${pkgPathFull}/src/parser.c`,
          `${pkgPathFull}/src/scanner.c`, // TODO glob: *.c | *.cc | *.cpp
          // TODO add -xc++ for scanner.cc / scanner.cpp
        ];
        console.log(`${pluginName}: compile ${pkgPathFull} -> ${outWasmPath}`)
        const emccEnv = { ...process.env };
        delete emccEnv.NODE; // fix warning: honoring legacy environment variable `NODE`
        const emccProcess = child_process.spawnSync(compileArgs[0], compileArgs.slice(1), {
          stdio: [null, 'pipe', 'pipe'],
          //stdio: 'inherit',
          env: emccEnv,
          encoding: 'utf8'
        });
        if (emccProcess.status != 0) {
          console.error(`${pluginName}: buildStart: compile error: code ${emccProcess.status}`)
          if (emccProcess.status == null) {
            console.error(`${pluginName}: buildStart: compile error: emcc not found?`)
          }
          // print emcc output only on error
          console.log('emcc output:');
          console.log(emccProcess.stdout);
          console.log('emcc error:');
          console.log(emccProcess.stderr);
        }
        /*
        else {
          console.error(`${pluginName}: buildStart: compile ok: ${outWasmPath}`)
        }
        */

        wasmMap.set(path.basename(outWasmPath), { path: outWasmPath, isNodeModule });
      };

      for await (const localPath of localPathList) {
        await prepareBuild(localPath, false);
      }

      for await (const localPath of npmPathList) {
        await prepareBuild(localPath, true);
      }
    },

    configureServer({ middlewares }) {
      return () => {
        // send 'root/pkg/xxx.wasm' file to user
        middlewares.use((req, res, next) => {
          if (req.url) {
            const urlName = path.basename(req.url);
            res.setHeader(
              'Cache-Control',
              'no-cache, no-store, must-revalidate'
            );
            const wasm = wasmMap.get(urlName);
            if (wasm) {
              console.log(`${pluginName}: serve ${req.url} -> ${wasm.path}`)
              res.writeHead(200, { 'Content-Type': 'application/wasm' });
              fs.createReadStream(wasm.path).pipe(res);
            } else {
              next();
            }
          }
        });
      };
    },

    // TODO ...
    /* this kills the vite devserver when its trying to restart (after config reload)
    buildEnd() {
      // copy xxx.wasm files to /assets/xxx.wasm
      wasmMap.forEach((crate, fileName) => {
        this.emitFile({
          type: 'asset',
          fileName: `assets/${fileName}`,
          source: fs.readFileSync(crate.path)
        });
      });
    }
    */
  };
}
