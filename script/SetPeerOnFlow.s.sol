// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Script.sol";
import "../contracts/WrappedGalacticKittiesONFT.sol";

contract SetPeerOnFlow is Script {
    function run() external {
        address flowOnft = 0x255763f3fC9774E04559ee7A4d49F78a27759C09;
        address baseAdapter = 0x7eD427C937235822c43D30c56aa52823E55E0c42;
        uint32 baseEid = 40245;

        uint256 privateKey = vm.envUint("FLOW_TESTNET_PRIVATE_KEY");

        vm.startBroadcast(privateKey);
        WrappedGalacticKittiesONFT(flowOnft).setPeer(baseEid, bytes32(uint256(uint160(baseAdapter))));
        vm.stopBroadcast();

        console.log("Flow ONFT peer set to Base adapter");
    }
}
