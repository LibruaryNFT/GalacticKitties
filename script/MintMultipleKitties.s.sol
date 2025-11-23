// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Script.sol";
import "../contracts/GalacticKitties.sol";

contract MintMultipleKitties is Script {
    function run() external {
        uint256 privateKey = vm.envUint("BASE_SEPOLIA_PRIVATE_KEY");
        address owner = vm.addr(privateKey);

        address galacticKitties = 0x3A25Ec105ac25f27476998616555674F7F8EBA3E;

        vm.startBroadcast(privateKey);

        GalacticKitties gk = GalacticKitties(galacticKitties);

        // Mint 12 NFTs (will be tokens 4-15 if you already have 1-3)
        uint256 numToMint = 12;

        console.log("Minting %d NFTs...", numToMint);
        console.log("");

        for (uint256 i = 0; i < numToMint; i++) {
            uint256 tokenId = gk.mint();
            console.log("Minted Galactic Kitty #%d", tokenId);
        }

        vm.stopBroadcast();

        console.log("");
        console.log("All NFTs minted!");
    }
}
