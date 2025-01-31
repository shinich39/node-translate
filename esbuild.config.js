import fs from "node:fs";
import path from "node:path";
import * as esbuild from 'esbuild';

function camelize(str) {
  return str.replace(/[_.-](\w|$)/g, function (_, x) {
    return x.toUpperCase();
  });
}

/**
 * package.json
 */

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));
const MODULE_NAME = pkg.name.replace(/\W/g, "-").replace(/[-.]?(js|ts)$/, "");
const MODULE_VERSION = pkg.version;
const GLOBAL_NAME = camelize(MODULE_NAME);

/**
 * options
 */

const ESM = true;
const CJS = true;
const BROWSER = false;
const ENTRY_POINTS = ["./src/index.ts"];
const OUTPUT_DIR = "./dist";
// https://esbuild.github.io/api/#external
const externalPackages = [
  "cheerio",
  "franc",
  "iconv-lite",
  "puppeteer",
  "puppeteer-extra",
  "puppeteer-extra-plugin-stealth",
];
// https://esbuild.github.io/api/#packages
const bundlePackages = true;

const options = [];

if (ESM) {
  options.push(
    {
      entryPoints: ENTRY_POINTS,
      platform: BROWSER ? "browser" : "node",
      format: 'esm',
      bundle: true,
      outfile: `${OUTPUT_DIR}/index.mjs`,
      external: externalPackages,
      ...(bundlePackages ? {} : { packages: "external" }),
    },
    {
      entryPoints: ENTRY_POINTS,
      platform: BROWSER ? "browser" : "node",
      format: 'esm',
      bundle: true,
      minify: true,
      outfile: `${OUTPUT_DIR}/index.min.mjs`,
      external: externalPackages,
      ...(bundlePackages ? {} : { packages: "external" }),
    },
  );
}

if (CJS) {
  options.push(
    {
      entryPoints: ENTRY_POINTS,
      platform: BROWSER ? "browser" : "node",
      format: 'cjs',
      bundle: true,
      outfile: `${OUTPUT_DIR}/index.cjs`,
      external: externalPackages,
      ...(bundlePackages ? {} : { packages: "external" }),
    },
    {
      entryPoints: ENTRY_POINTS,
      platform: BROWSER ? "browser" : "node",
      format: 'cjs',
      bundle: true,
      minify: true,
      outfile: `${OUTPUT_DIR}/index.min.cjs`,
      external: externalPackages,
      ...(bundlePackages ? {} : { packages: "external" }),
    },
  );
}

if (BROWSER) {
  options.push(
    {
      entryPoints: ENTRY_POINTS,
      platform: "browser",
      format: "iife",
      globalName: GLOBAL_NAME,
      bundle: true,
      outfile: `${OUTPUT_DIR}/index.js`,
      external: externalPackages,
    },
    {
      entryPoints: ENTRY_POINTS,
      platform: "browser",
      format: "iife",
      globalName: GLOBAL_NAME,
      bundle: true,
      minify: true,
      outfile: `${OUTPUT_DIR}/index.min.js`,
      external: externalPackages,
    },
  );
}

/**
 * clear dist directory
 */

if (fs.existsSync("./dist")) {
  fs.rmSync("./dist", { recursive: true });
}

/**
 * execution
 */

for (const option of options) {
  await esbuild.build(option);
}