import { BuildOutput } from "bun";

const bytesToSize = (bytes: number, suffixes: string[] = ["B", "\x1b[92mK\x1b[m", "\x1b[93mM\x1b[m", "\x1b[95mG\x1b[m", "\x1b[91mT\x1b[m"], top = false): string => {
  if (bytes === 0) return top ? "0" : "";

  const i = Math.floor(bytes / 1024);
  const j = bytes % 1024;

  const sizeLower = `${j}${suffixes.shift()}`;
  if (i === 0) return sizeLower;
  const sizeUpper = bytesToSize(i, suffixes, true);

  return sizeUpper ? `${sizeUpper} ${sizeLower}` : sizeLower;
}

Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
}).then((output: BuildOutput) => {
  console.log("# Build Output");
  output.logs.forEach((log) => {
    console.log(log);
  });

  console.log("# Artifacts");
  output.outputs.forEach((artifact) => {
    console.log(`- ${artifact.name} -- ${bytesToSize(artifact.size)}`);
  });

  if (output.success) {
    console.log("Build succeeded!");
  } else {
    console.log("Build failed.");
  }
}).catch((err) => {
  console.error(err);
});