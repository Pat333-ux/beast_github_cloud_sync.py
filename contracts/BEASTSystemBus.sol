// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title BEASTSystemBus
 * @dev Decentralized Event Bus & Governance Gateway for BEAST System 3.0
 */
contract BEASTSystemBus {
    
    // Governing Officer & Admin Addresses
    address public governingOfficer;
    
    // System Bus Event
    event SystemEventEmitted(
        bytes32 indexed eventId,
        string indexed moduleName,
        string eventType,
        bytes payload,
        uint256 timestamp,
        address indexed caller
    );

    event GovernanceRoleUpdated(address indexed targetAccount, string role, bool status);

    // Mappings for authorized module emitters and execution roles
    mapping(address => bool) public authorizedEmitters;
    mapping(bytes32 => bool) public processedEvents;

    modifier onlyGoverningOfficer() {
        require(msg.sender == governingOfficer, "BEASTSystemBus: Caller is not Governing Officer");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedEmitters[msg.sender] || msg.sender == governingOfficer, "BEASTSystemBus: Unauthorized emitter");
        _;
    }

    constructor() {
        governingOfficer = msg.sender;
        authorizedEmitters[msg.sender] = true;
    }

    /**
     * @notice Emit a standardized system event onto the BEAST System Bus.
     * @param moduleName Name of the originating subsystem (e.g., "LUCR_TREASURY", "CONSTITUTION_ENGINE").
     * @param eventType Classification of the action (e.g., "RESOURCE_ALLOCATION", "GRANT_APPROVED").
     * @param payload Encoded parameters or IPFS multi-hash associated with the event.
     */
    function emitSystemEvent(
        string calldata moduleName,
        string calldata eventType,
        bytes calldata payload
    ) external onlyAuthorized returns (bytes32 eventId) {
        eventId = keccak256(
            abi.encodePacked(
                moduleName,
                eventType,
                payload,
                block.timestamp,
                msg.sender,
                block.chainid
            )
        );

        require(!processedEvents[eventId], "BEASTSystemBus: Event ID collision");
        processedEvents[eventId] = true;

        emit SystemEventEmitted(
            eventId,
            moduleName,
            eventType,
            payload,
            block.timestamp,
            msg.sender
        );

        return eventId;
    }

    /**
     * @notice Authorize or revoke system module addresses capable of dispatching events.
     */
    function setAuthorizedEmitter(address emitter, bool status) external onlyGoverningOfficer {
        authorizedEmitters[emitter] = status;
        emit GovernanceRoleUpdated(emitter, "MODULE_EMITTER", status);
    }

    /**
     * @notice Transfer Governing Officer administrative authority.
     */
    function transferGovernance(address newGoverningOfficer) external onlyGoverningOfficer {
        require(newGoverningOfficer != address(0), "BEASTSystemBus: Invalid address");
        governingOfficer = newGoverningOfficer;
        authorizedEmitters[newGoverningOfficer] = true;
    }
}
