// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * FUNCTIONALITIES
 *
 * - List products.
 *
 * - Buy products.
 *
 * - Withdraw Funds.
 */
contract Dappazon {
    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }

    string public name;
    address public owner;
    mapping(uint256 => Item) public items;

    event List(string name, uint256 cost, uint256 quantity);
    modifier ownerOnly() {
        require(
            msg.sender == owner,
            "Only the owner can perform this operation"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function list(
        uint256 _id,
        string memory _name, 
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public ownerOnly {
        Item memory item = Item(
            _id,
            _name,
            _category,
            _image,
            _cost,
            _rating,
            _stock
        );

        items[_id] = item;
        emit List(_name, _cost, _stock);
    }
}
