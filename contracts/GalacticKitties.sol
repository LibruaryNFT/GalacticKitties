// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GalacticKitties is ERC721, Ownable {
    uint256 private _nextTokenId;
    string private _baseTokenURI;
    
    // NEW: Mapping for individual token URIs
    mapping(uint256 => string) private _tokenURIs;

    constructor(string memory baseTokenURI_)
        ERC721("Galactic Kitties", "GKITTY")
        Ownable(msg.sender)
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

    /// @notice Owner can update the base URI
    function setBaseTokenURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    /// @notice NEW: Set individual token URI (for Filecoin PieceCIDs)
    /// @param tokenId The token ID to set URI for
    /// @param uri The full URI (e.g., "filecoin://bafkzcibd...")
    function setTokenURI(uint256 tokenId, string calldata uri) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        _tokenURIs[tokenId] = uri;
    }

    /// @notice NEW: Batch set token URIs (gas efficient for multiple tokens)
    /// @param tokenIds Array of token IDs
    /// @param uris Array of URIs matching token IDs
    function setTokenURIBatch(uint256[] calldata tokenIds, string[] calldata uris) external onlyOwner {
        require(tokenIds.length == uris.length, "Array length mismatch");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(ownerOf(tokenIds[i]) != address(0), "Token does not exist");
            _tokenURIs[tokenIds[i]] = uris[i];
        }
    }

    /// @notice Override tokenURI to support individual token URIs
    /// @dev If individual URI is set, use that. Otherwise fall back to baseURI + tokenId
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        
        string memory _tokenURI = _tokenURIs[tokenId];
        
        // If individual URI is set, return it
        if (bytes(_tokenURI).length > 0) {
            return _tokenURI;
        }
        
        // Otherwise use baseURI + tokenId (standard behavior)
        return super.tokenURI(tokenId);
    }

    /// @dev Internal hook used by ERC721 to build default tokenURI
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}