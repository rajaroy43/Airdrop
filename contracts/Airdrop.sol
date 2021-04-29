// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Airdrop {
    IERC20 public token;
    address public admin;
    uint256 public currentAirdropAmount;
    uint256 public maxAirdropAmount = 10000 * 10**18;
    mapping(address => bool) public processedAirdrops;
    event AirdropProcessed(
        address indexed recipient,
        uint256 amount,
        uint256 date
    );
    modifier onlyOwner() {
        require(msg.sender == admin, "only admin");
        _;
    }

    constructor(address _mkToken) {
        admin = msg.sender;
        token = IERC20(_mkToken);
    }

    function updateAdmin(address _newAdmin) public onlyOwner {
        admin = _newAdmin;
    }

    function claimTokens(
        address recipient,
        uint256 amount,
        bytes calldata signature
    ) external {
        bytes32 messageHash =
            getEthSignedMessagehash(
                keccak256(abi.encodePacked(recipient, amount))
            );
        require(
            recoverSigner(messageHash, signature) == admin,
            "wrong signature"
        );
        require(!processedAirdrops[recipient], "airdrop already processed");
        require(
            currentAirdropAmount + amount <= maxAirdropAmount,
            "airdropped 100% of the tokens"
        );
        currentAirdropAmount += amount;
        processedAirdrops[recipient]=true;
        token.transfer(recipient, amount);
        emit AirdropProcessed(recipient, amount, block.timestamp);
    }

    function getEthSignedMessagehash(bytes32 messageHash)
        internal
        pure
        returns (bytes32)
    {
        return (
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    messageHash
                )
            )
        );
    }

    function recoverSigner(bytes32 ethSignedMessageHash, bytes memory sig)
        internal
        pure
        returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(sig);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig)
        internal
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(sig.length == 65, "invalid signature length");
        assembly {
            r := mload(add(sig, 32)) //add(sig,32) ==> Skips first 32 bytes . mload(something)=> load next 32bytes starting at memory address something
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}
