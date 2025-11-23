// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Script.sol";
import "../src/WrappedGalacticKittiesONFT.sol";

contract DeployFlowONFT is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("FLOW_TESTNET_PRIVATE_KEY");

        address lzEndpoint = 0x6C7Ab2202C98C4227C5c46f1417D81144DA716Ff;
        address delegate = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        WrappedGalacticKittiesONFT onft = new WrappedGalacticKittiesONFT(lzEndpoint, delegate);

        vm.stopBroadcast();

        console.log("WrappedGalacticKittiesONFT deployed to:", address(onft));
    }
}
