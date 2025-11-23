// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Script.sol";
import "../contracts/GalacticKittiesAdapter.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@layerzerolabs/onft-evm/contracts/onft721/interfaces/IONFT721.sol";

contract BridgeNFT is Script {
    function run() external {
        uint256 privateKey = vm.envUint("BASE_SEPOLIA_PRIVATE_KEY");
        address owner = vm.addr(privateKey);

        address galacticKitties = 0x3A25Ec105ac25f27476998616555674F7F8EBA3E;
        address adapter = 0x7eD427C937235822c43D30c56aa52823E55E0c42;
        uint32 flowEid = 40351;
        uint256 tokenId = 1;

        vm.startBroadcast(privateKey);

        // 1. Approve adapter to move your NFT
        IERC721(galacticKitties).approve(adapter, tokenId);
        console.log("Approved adapter to move token", tokenId);

        // 2. Build SendParam
        SendParam memory sendParam = SendParam({
            dstEid: flowEid,
            to: bytes32(uint256(uint160(owner))),
            tokenId: tokenId,
            extraOptions: bytes(""),
            composeMsg: bytes(""),
            onftCmd: bytes("")
        });

        // 3. Quote the fee
        MessagingFee memory fee = GalacticKittiesAdapter(adapter).quoteSend(sendParam, false);
        console.log("Bridge fee (wei):", fee.nativeFee);

        // 4. Bridge the NFT
        GalacticKittiesAdapter(adapter).send{value: fee.nativeFee}(sendParam, fee, owner);

        vm.stopBroadcast();

        console.log("NFT bridged! Token ID:", tokenId);
        console.log("Check LayerZero Scan: https://testnet.layerzeroscan.com");
    }
}
