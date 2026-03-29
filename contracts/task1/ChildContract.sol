// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ChildContract {
    address public owner;
    string public name;
    uint256 public balance;

    constructor(address _owner, string memory _name) payable {
        owner = _owner;
        name = _name;
        balance = msg.value;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    receive() external payable {
        balance += msg.value;
    }
}