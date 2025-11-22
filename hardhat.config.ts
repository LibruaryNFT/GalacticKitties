import "@nomicfoundation/hardhat-ethers";
import { defineConfig } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  solidity: {
    profiles: {
      default: {
        version: "0.8.22",
        settings: {
          remappings: [
            "@layerzerolabs/onft-evm/=node_modules/@layerzerolabs/onft-evm/",
            "@layerzerolabs/oapp-evm/=node_modules/@layerzerolabs/oapp-evm/",
            "@layerzerolabs/lz-evm-protocol-v2/=node_modules/@layerzerolabs/lz-evm-protocol-v2/",
            "@openzeppelin/=node_modules/@openzeppelin/",
          ],
        },
      },
      production: {
        version: "0.8.22",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          remappings: [
            "@layerzerolabs/onft-evm/=node_modules/@layerzerolabs/onft-evm/",
            "@layerzerolabs/oapp-evm/=node_modules/@layerzerolabs/oapp-evm/",
            "@layerzerolabs/lz-evm-protocol-v2/=node_modules/@layerzerolabs/lz-evm-protocol-v2/",
            "@openzeppelin/=node_modules/@openzeppelin/",
          ],
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    baseSepolia: {
      type: "http",
      chainType: "op",
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.BASE_SEPOLIA_PRIVATE_KEY
        ? [process.env.BASE_SEPOLIA_PRIVATE_KEY]
        : [],
    },
    flowTestnet: {
      type: "http",
      chainType: "l1",
      url: process.env.FLOW_EVM_RPC_URL || "https://testnet.evm.nodes.onflow.org",
      accounts: process.env.FLOW_TESTNET_PRIVATE_KEY
        ? [process.env.FLOW_TESTNET_PRIVATE_KEY]
        : [],
    },
  },
});