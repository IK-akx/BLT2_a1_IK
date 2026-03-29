// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LogicV1.sol";

contract LogicV2 is LogicV1 {
    event CounterDecremented(uint256 newValue);
    event CounterReset();

    function decrement() public {
        require(counter > 0, "Counter cannot be negative");
        counter--;
        emit CounterDecremented(counter);
    }

    function reset() public {
        counter = 0;
        emit CounterReset();
    }
}