import { network } from "hardhat";

async function main() {
  // This automatically respects --network baseSepolia
  const { ethers } = await network.connect();

  const baseTokenURI = "ipfs://QmDummyCID/"; // TODO: replace with Filecoin CID later

  const GalacticKitties = await ethers.getContractFactory("GalacticKitties");
  const gk = await GalacticKitties.deploy(baseTokenURI);

  await gk.waitForDeployment();

  // In Hardhat 3 + ethers v6, either gk.target or gk.getAddress() works:
  const address = gk.target ?? (await gk.getAddress());

  console.log("Galactic Kitties deployed at:", address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
