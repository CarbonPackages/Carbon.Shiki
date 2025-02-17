import esbuild from "esbuild";

const watch = process.argv.includes("--watch");
const dev = process.argv.includes("--dev");
const minify = !dev && !watch;

/** @type {import("esbuild").BuildOptions} */
const options = {
    logLevel: "info",
    bundle: true,
    minify,
    sourcemap: watch,
    target: "es2020",
    legalComments: "none",
    format: "esm",
    splitting: true,
    loader: {
        ".js": "jsx",
        ".pcss": "css",
    },
    entryPoints: ["Resources/Private/Main.js"],
    outdir: "Resources/Public/Modules",
};

if (minify) {
    options.drop = ["debugger"];
    options.pure = ["console.log"];
    options.dropLabels = ["DEV"];
}

if (watch) {
    esbuild.context(options).then((ctx) => ctx.watch());
} else {
    esbuild.build(options);
}
