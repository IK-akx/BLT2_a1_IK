// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ChildContract.sol";

contract Factory {
    address[] public deployedContracts;
    mapping(address => bool) public isDeployed;

    event Deployed(address indexed contractAddress, string method, bytes32 salt);

    // CREATE deployment
    function deployWithCreate(string memory _name) public payable returns (address) {
        ChildContract child = new ChildContract{value: msg.value}(msg.sender, _name);
        address childAddr = address(child);
        
        deployedContracts.push(childAddr);
        isDeployed[childAddr] = true;
        
        emit Deployed(childAddr, "CREATE", bytes32(0));
        return childAddr;
    }

    // CREATE2 deployment
    function deployWithCreate2(string memory _name, bytes32 salt) public payable returns (address) {
        ChildContract child = new ChildContract{salt: salt, value: msg.value}(msg.sender, _name);
        address childAddr = address(child);
        
        deployedContracts.push(childAddr);
        isDeployed[childAddr] = true;
        
        emit Deployed(childAddr, "CREATE2", salt);
        return childAddr;
    }

    // Get all deployed addresses
    function getDeployedContracts() public view returns (address[] memory) {
        return deployedContracts;
    }

    // Pre-compute CREATE2 address
    function getCreate2Address(string memory _name, bytes32 salt) public view returns (address) {
        bytes memory bytecode = abi.encodePacked(
            type(ChildContract).creationCode,
            abi.encode(msg.sender, _name)
        );
        
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(bytecode)
            )
        );
        
        return address(uint160(uint256(hash)));
    }
}

