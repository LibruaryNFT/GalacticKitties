// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GalacticKitties is ERC721, Ownable {
    uint256 private _nextTokenId;
    string private _baseTokenURI;

    constructor(string memory baseTokenURI_)
        ERC721("Galactic Kitties", "GKITTY")
        Ownable(msg.sender) // set deployer as initial owner (required in OZ v5)
    {
        _nextTokenId = 1;
        _baseTokenURI = baseTokenURI_;
    }

    /// @notice Mint a new Galactic Kitty to the caller
    function mint() external returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId += 1;

        _safeMint(msg.sender, tokenId);
        return tokenId;
    }

    /// @notice Owner can update the base URI (we'll later point this to a Filecoin/IPFS folder CID)
    function setBaseTokenURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    /// @dev Internal hook used by ERC721 to build tokenURI(tokenId)
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}
