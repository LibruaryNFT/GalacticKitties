// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../contracts/GalacticKitties.sol";

contract DeployGalacticKittiesV2 is Script {
    function run() external {
        uint256 privateKey = vm.envUint("BASE_SEPOLIA_PRIVATE_KEY");

        vm.startBroadcast(privateKey);

        // Deploy with empty baseURI (we'll use individual URIs)
        GalacticKitties gk = new GalacticKitties("");

        vm.stopBroadcast();

        console.log("GalacticKitties V2 deployed to:", address(gk));
    }
}
