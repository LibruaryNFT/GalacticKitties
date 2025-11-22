// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "../node_modules/@layerzerolabs/onft-evm/contracts/onft721/ONFT721.sol";

contract WrappedGalacticKittiesONFT is ONFT721 {
    constructor(
        address _lzEndpoint,
        address _delegate
    ) ONFT721("Wrapped Galactic Kitties", "wGKITTY", _lzEndpoint, _delegate) {}
}