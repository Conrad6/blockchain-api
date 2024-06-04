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

    struct Order {
        uint256 time;
        Item item;
    }

    string public name;
    address public owner;
    mapping(uint256 => Item) public items;
    mapping(address => uint256) public orderCount;
    mapping(address => mapping(uint256 => Order)) public orders;

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

    function buy(uint256 _id) public payable {
        Item memory item = items[_id];

        Order memory order = Order(block.timestamp, item);

        orderCount[msg.sender]++;
        orders[msg.sender][orderCount[msg.sender]] = order;
        items[_id].stock = item.stock - 1;
    }
}
