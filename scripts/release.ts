// Release helper used by .github/workflows/release.yml.
//
//   bun scripts/release.ts pack                 build tarballs into .release/ and verify them
//   bun scripts/release.ts publish              publish verified tarballs that are not on npm yet
//   bun scripts/release.ts deprecate <v...>     deprecate older versions of every package
//
// Tarballs are packed with `bun pm pack` (it rewrites `workspace:*` to concrete versions) and
// checked before anything is published: v1.3.0 reached npm depending on @intl-t/*@1.2.0.
import { $ } from "bun";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const out = join(root, ".release");

// Dependencies first, so a consumer never sees a version whose internal deps are missing.
const order = ["declarations", "format", "locales", "utils", "core", "react", "next"].map(name => `packages/${name}`).concat(".");

interface Manifest {
  name: string;
  version: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

const read = (dir: string) => Bun.file(join(root, dir, "package.json")).json() as Promise<Manifest>;
const version = (await read(".")).version;
const internal = (name: string) => name === "intl-t" || name.startsWith("@intl-t/");
const tarballOf = (name: string, ver = version) => join(out, `${name.replace("@", "").replace("/", "-")}-${ver}.tgz`);

async function packages() {
  const list = await Promise.all(order.map(async dir => ({ dir, manifest: await read(dir) })));
  return list.filter(({ manifest }) => !manifest.private);
}

async function pack() {
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const problems: string[] = [];
  for (const { dir, manifest } of await packages()) {
    if (manifest.version !== version) {
      problems.push(`${manifest.name} is ${manifest.version}, root is ${version}`);
      continue;
    }
    await $`bun pm pack --destination ${out} --quiet`.cwd(join(root, dir)).quiet();
    const packed = JSON.parse(await $`tar -xOzf ${tarballOf(manifest.name)} package/package.json`.text()) as Manifest;
    const deps = { ...packed.dependencies, ...packed.peerDependencies, ...packed.optionalDependencies };
    for (const [dep, range] of Object.entries(deps)) {
      if (range.startsWith("workspace:")) problems.push(`${packed.name} -> ${dep}@${range} was not rewritten`);
      else if (internal(dep) && range !== version) problems.push(`${packed.name} -> ${dep}@${range}, expected ${version}`);
    }
    console.log(`packed ${packed.name}@${packed.version}`);
  }
  if (problems.length) {
    console.error(`\nRefusing to release ${version}:\n- ${problems.join("\n- ")}`);
    process.exit(1);
  }
  console.log(`\n${readdirSync(out).length} tarballs verified for ${version}`);
}

async function published(name: string) {
  const res = await $`npm view ${`${name}@${version}`} version`.quiet().nothrow();
  return res.exitCode === 0 && res.stdout.toString().trim() === version;
}

async function publish() {
  for (const { manifest } of await packages()) {
    if (await published(manifest.name)) {
      console.log(`skip ${manifest.name}@${version} (already on npm)`);
      continue;
    }
    await $`npm publish ${tarballOf(manifest.name)} --access public --provenance`;
    console.log(`published ${manifest.name}@${version}`);
  }
}

async function deprecate(versions: string[]) {
  const message = `Upgrade to ${version} or later: fixes GHSA-rgx2-wxxf-mhq9 (ReDoS in message variable injection).`;
  for (const { manifest } of await packages())
    for (const old of versions) {
      const res = await $`npm deprecate ${`${manifest.name}@${old}`} ${message}`.nothrow();
      console.log(`${res.exitCode === 0 ? "deprecated" : "could not deprecate"} ${manifest.name}@${old}`);
    }
}

const [command, ...args] = process.argv.slice(2);
if (command === "pack") await pack();
else if (command === "publish") await publish();
else if (command === "deprecate") await deprecate(args.filter(Boolean));
else {
  console.error("usage: bun scripts/release.ts <pack|publish|deprecate <versions...>>");
  process.exit(1);
}
