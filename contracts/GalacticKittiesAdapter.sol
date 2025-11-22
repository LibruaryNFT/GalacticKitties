// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "../node_modules/@layerzerolabs/onft-evm/contracts/onft721/ONFT721Adapter.sol";

contract GalacticKittiesAdapter is ONFT721Adapter {
    constructor(
        address _token,
        address _lzEndpoint,
        address _delegate
    ) ONFT721Adapter(_token, _lzEndpoint, _delegate) {}
}