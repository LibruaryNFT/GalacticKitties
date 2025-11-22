// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Script.sol";
import "../src/GalacticKittiesAdapter.sol";

contract DeployBaseAdapter is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("BASE_SEPOLIA_PRIVATE_KEY");
        
        address galacticKitties = 0x23F1a69E8100D758bb1E88F783e565739f66F6E5;
        address lzEndpoint = 0x6EDCE65403992e310A62460808c4b910D972f10f;
        address delegate = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        GalacticKittiesAdapter adapter = new GalacticKittiesAdapter(
            galacticKitties,
            lzEndpoint,
            delegate
        );
        
        vm.stopBroadcast();
        
        console.log("GalacticKittiesAdapter deployed to:", address(adapter));
    }
}