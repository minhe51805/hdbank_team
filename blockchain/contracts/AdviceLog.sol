// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AdviceLog - Minimal audit log for AI financial advice
/// @notice Emits events capturing hashes of AI input/output without storing PII
contract AdviceLog {
    event AdviceRecorded(
        bytes32 indexed inputHash,
        bytes32 indexed outputHash,
        string modelVersion,
        string persona,
        bytes32 indexed customerHash,
        bytes32 sessionHash,
        string stage,
        uint256 blockTime,
        bytes32 nonce
    );

    /// @notice Record an advice event (hashes must be precomputed off-chain)
    function recordAdvice(
        bytes32 inputHash,
        bytes32 outputHash,
        string calldata modelVersion,
        string calldata persona,
        bytes32 customerHash,
        bytes32 sessionHash,
        string calldata stage,
        bytes32 nonce
    ) external {
        emit AdviceRecorded(
            inputHash,
            outputHash,
            modelVersion,
            persona,
            customerHash,
            sessionHash,
            stage,
            block.timestamp,
            nonce
        );
    }
}


