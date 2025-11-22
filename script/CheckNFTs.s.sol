// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract CheckNFTs is Script {
    function run() external view {
        uint256 privateKey = vm.envUint("BASE_SEPOLIA_PRIVATE_KEY");
        address owner = vm.addr(privateKey);
        
        address galacticKitties = 0x23F1a69E8100D758bb1E88F783e565739f66F6E5;
        
        console.log("Checking NFTs for address:", owner);
        console.log("");
        
        // Check balance
        uint256 balance = IERC721(galacticKitties).balanceOf(owner);
        console.log("Total NFTs owned:", balance);
        
        if (balance == 0) {
            console.log("You don't own any GalacticKitties NFTs");
            console.log("Mint one first with: cast send 0x23F1a69E8100D758bb1E88F783e565739f66F6E5 'mint()' --rpc-url https://sepolia.base.org --private-key YOUR_KEY");
            return;
        }
        
        console.log("");
        console.log("Checking token IDs (this may take a while)...");
        console.log("Owned token IDs:");
        
        // Check first 100 token IDs (adjust range if needed)
        uint256 foundTokens = 0;
        for (uint256 i = 1; i <= 100 && foundTokens < balance; i++) {
            try IERC721(galacticKitties).ownerOf(i) returns (address tokenOwner) {
                if (tokenOwner == owner) {
                    console.log("  - Token ID:", i);
                    foundTokens++;
                }
            } catch {
                // Token doesn't exist, continue
            }
        }
    }
}