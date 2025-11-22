// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Script.sol";
import "../src/WrappedGalacticKittiesONFT.sol";

contract SetPeerOnFlow is Script {
    function run() external {
        address flowOnft = 0xEff1A41FC690152a9C2ce26aF24aF0dbB321397B;
        address baseAdapter = 0x953015B459e7862DE2d2CF3624c2DadfFf6310c2;
        uint32 baseEid = 40245;
        
        uint256 privateKey = vm.envUint("FLOW_TESTNET_PRIVATE_KEY");
        
        vm.startBroadcast(privateKey);
        WrappedGalacticKittiesONFT(flowOnft).setPeer(baseEid, bytes32(uint256(uint160(baseAdapter))));
        vm.stopBroadcast();
        
        console.log("Flow ONFT peer set to Base adapter");
    }
}