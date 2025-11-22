// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Script.sol";
import "../src/GalacticKittiesAdapter.sol";

contract SetPeerOnBase is Script {
    function run() external {
        address baseAdapter = 0x953015B459e7862DE2d2CF3624c2DadfFf6310c2;
        address flowOnft = 0xEff1A41FC690152a9C2ce26aF24aF0dbB321397B;
        uint32 flowEid = 40351;
        
        uint256 privateKey = vm.envUint("BASE_SEPOLIA_PRIVATE_KEY");
        
        vm.startBroadcast(privateKey);
        GalacticKittiesAdapter(baseAdapter).setPeer(flowEid, bytes32(uint256(uint160(flowOnft))));
        vm.stopBroadcast();
        
        console.log("Base adapter peer set to Flow ONFT");
    }
}