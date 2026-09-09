import { network } from "hardhat";

const ARBITRUM_SEPOLIA_RELAY = "0xA73EB3aAcE334FFF3b910AdF40AbFF4bB25E93dD";

const { ethers } = await network.getOrCreate({ network: "arbitrumSepolia" });

const relay = await ethers.getContractAt("CrossChainRelay", ARBITRUM_SEPOLIA_RELAY);

const currentBlock = await ethers.provider.getBlockNumber();
console.log("Bloque actual:", currentBlock);

const filter = relay.filters.AttestationReceived();
const allEvents = [];

// El plan gratuito de Alchemy limita eth_getLogs a 10 bloques por consulta,
// asi que recorremos hacia atras en bloques de 10, buscando en los ultimos ~2000.
for (let i = 0; i < 3000; i++) {
  const toBlock = currentBlock - i * 10;
  const fromBlock = toBlock - 9;
  if (fromBlock < 0) break;

  const events = await relay.queryFilter(filter, fromBlock, toBlock);
  if (events.length > 0) {
    allEvents.push(...events);
    console.log(`Encontrado en el rango ${fromBlock}-${toBlock}`);
    break;
  }
}

console.log("Eventos AttestationReceived encontrados:", allEvents.length);

for (const event of allEvents) {
  console.log("---");
  console.log("srcEid:", event.args.srcEid);
  console.log("uid:", event.args.uid);
  console.log("schema:", event.args.schema);
  console.log("attester:", event.args.attester);
  console.log("recipient:", event.args.recipient);
  console.log("tx hash:", event.transactionHash);
}