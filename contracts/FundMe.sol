// SPDX-License-Identifier: MIT
// 1. Pragma
pragma solidity ^0.8.8;
// 2. Import
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

//3. Interfaces, Libraries, Contracts
error FundMe_NotOwner();

/**@title A sample Funding Contract
 * @author Bui Nam
 * @notice This contract is for creating a sample funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
    // Type Declarations(None!)

    // State variables
    address[] public funders;
    address public immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10**18;
    AggregatorV3Interface public immutable i_priceFeed;
    mapping(address => uint256) public addressToAmountFunded;

    // Events (we have none!)

    // Modifiers
    modifier onlyOwner() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe_NotOwner();
        _;
    }

    // Constructor
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // Functions Order:
    //// receive
    //// fallback
    //// external
    //// public
    //// internal
    //// private
    //// view / pure

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /// @notice Funds our contract based on the ETH/USD price
    function fund() public payable {
        // require(msg.value.getConversionRate() >= MINIMUM_USD, "You need to spend more ETH!");
        require(
            PriceConverter.getConversionRate(msg.value, i_priceFeed) >=
                MINIMUM_USD,
            "You need to spend more ETH!"
        );
        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);
    }

    function withdraw() public payable onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function getVersion() public view returns (uint256) {
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
        return AggregatorV3Interface(i_priceFeed).version();
    }

}
