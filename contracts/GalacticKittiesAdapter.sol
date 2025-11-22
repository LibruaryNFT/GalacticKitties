// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@layerzerolabs/onft-evm/contracts/onft721/ONFT721Adapter.sol";

contract GalacticKittiesAdapter is ONFT721Adapter {
    constructor(
        address _token,      // 0x23F1a69E8100D758bb1E88F783e565739f66F6E5 (your existing GalacticKitties)
        address _lzEndpoint, // 0x6EDCE65403992e310A62460808c4b910D972f10f (Base Sepolia)
        address _delegate    // your wallet address
    ) ONFT721Adapter(_token, _lzEndpoint, _delegate) {}
}