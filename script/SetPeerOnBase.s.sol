// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Script.sol";
import "../contracts/GalacticKittiesAdapter.sol";

contract SetPeerOnBase is Script {
    function run() external {
        address baseAdapter = 0x7eD427C937235822c43D30c56aa52823E55E0c42;
        address flowOnft = 0x255763f3fC9774E04559ee7A4d49F78a27759C09;
        uint32 flowEid = 40351;

        uint256 privateKey = vm.envUint("BASE_SEPOLIA_PRIVATE_KEY");

        vm.startBroadcast(privateKey);
        GalacticKittiesAdapter(baseAdapter).setPeer(flowEid, bytes32(uint256(uint160(flowOnft))));
        vm.stopBroadcast();

        console.log("Base adapter peer set to Flow ONFT");
    }
}
