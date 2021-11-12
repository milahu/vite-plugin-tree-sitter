//import type { Plugin } from 'vite';
type Plugin = any;

type Package = string | PackageObject;

type PackageObject = {
  path: string,
  type?: string,
};

export default function (
  packages: Package[],
  //options?: { ... }
): Plugin;
