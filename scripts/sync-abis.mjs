// Sincroniza los ABIs de los contratos compilados hacia sdk/src/abis,
// extrayendo solo el campo "abi" (sin bytecode ni metadata extra).
// Se corre automaticamente antes de buildear el SDK (ver sdk/package.json).

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const contracts = [
  { source: "AttestationCore.sol/AttestationCore.json", name: "AttestationCore" },
  { source: "FeeCollector.sol/FeeCollector.json", name: "FeeCollector" },
  { source: "CrossChainRelay.sol/CrossChainRelay.json", name: "CrossChainRelay" },
];

const outDir = join(root, "sdk", "src", "abis");
mkdirSync(outDir, { recursive: true });

for (const { source, name } of contracts) {
  const artifactPath = join(root, "artifacts", "contracts", source);
  const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));

  const outPath = join(outDir, `${name}.json`);
  writeFileSync(outPath, JSON.stringify(artifact.abi, null, 2));

  console.log(`ABI sincronizado: ${name}`);
}

console.log("Sincronizacion de ABIs completa.");
