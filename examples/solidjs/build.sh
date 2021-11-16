#!/bin/sh

[ -d example ] && {
  echo "error: output dir exists: example"
  exit 1
}

git clone https://github.com/solidjs/templates --depth 1

mv -v templates/js example
rm -rf templates

(
  cd src
  find . -type f -exec cp -v '{}' '../example/{}' \;
)

cp ../../shell.nix example/

(
  cd example
  rm pnpm-lock.yaml
)

cat <<EOF
next steps:

cd example
nix-shell # install: node npm gnumake emcc
npm install
npm run dev
EOF
