import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const contractAddr = "0x23F1a69E8100D758bb1E88F783e565739f66F6E5";

  const gk = await ethers.getContractAt("GalacticKitties", contractAddr);

  const tx = await gk.mint();
  await tx.wait();

  console.log("Minted a Galactic Kitty!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
