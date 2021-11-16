{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {

nativeBuildInputs = [
];

buildInputs = with pkgs; [
nodejs
# build tree-sitter-nix.wasm
gnumake
emscripten
tree-sitter
];

}
