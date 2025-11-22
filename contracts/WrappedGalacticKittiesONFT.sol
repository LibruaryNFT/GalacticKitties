// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@layerzerolabs/onft-evm/contracts/onft721/ONFT721.sol";

contract WrappedGalacticKittiesONFT is ONFT721 {
    constructor(
        address _lzEndpoint, // 0x6C7Ab2202C98C4227C5c46f1417D81D4c2407882 (Flow EVM Testnet)
        address _delegate    // your wallet address
    ) ONFT721("Wrapped Galactic Kitties", "wGKITTY", _lzEndpoint, _delegate) {}
}