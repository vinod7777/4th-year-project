// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SmartCitySecurityLedger
 * @notice EVM-compatible incident audit and quarantine ledger for IoT network intrusion response.
 * Integrates with edge AI/1D-CNN threat detection pipelines.
 */
contract SmartCitySecurityLedger {
    // Authorized IoT gateway / security agent address
    address public immutable gatewayAuthority;

    // Device operational state
    enum DeviceStatus { Active, Suspicious, Quarantined }

    // Security incident structure
    struct SecurityIncident {
        uint256 incidentId;
        string deviceIdentifier;
        string municipalZone;
        uint8 attackCategory;       // 0: Benign, 1: DDoS/Flood, 2: Recon/PortScan, 3: Spoofing/Other
        uint16 confidenceScore;     // Basis points: 9500 = 95.00%, 10000 = 100.00%
        uint256 timestamp;
        bytes32 telemetryHash;
    }

    // Mapping from deviceIdentifier string to its current status
    mapping(string => DeviceStatus) public deviceStates;

    // Sequential ledger of all recorded security incidents
    SecurityIncident[] private incidentHistory;

    // Events for distributed node monitoring
    event SecurityAlertTriggered(
        uint256 indexed incidentId,
        string deviceId,
        string zone,
        uint8 category,
        uint16 confidence,
        bytes32 telemetryHash
    );

    event DeviceQuarantined(
        string indexed deviceId,
        string zone,
        uint256 timestamp
    );

    event DeviceReinstated(
        string indexed deviceId,
        uint256 timestamp
    );

    modifier onlyAuthority() {
        require(msg.sender == gatewayAuthority, "SmartCityLedger: Caller is not the authorized gateway");
        _;
    }

    /**
     * @notice Initializes the security ledger setting deployer as gatewayAuthority
     */
    constructor() {
        gatewayAuthority = msg.sender;
    }

    /**
     * @notice Records high-confidence intrusion detection and immediately quarantines the rogue device.
     * @dev Enforces confidence >= 9500 basis points (95.00%).
     */
    function recordIncidentAndQuarantine(
        string calldata _deviceId,
        string calldata _zone,
        uint8 _category,
        uint16 _confidence,
        bytes32 _telemetryHash
    ) external onlyAuthority returns (uint256) {
        require(_confidence >= 9500, "SmartCityLedger: Confidence score below 9500 bps quarantine threshold");
        require(bytes(_deviceId).length > 0, "SmartCityLedger: Device identifier cannot be empty");

        uint256 newIncidentId = incidentHistory.length + 1;

        SecurityIncident memory incident = SecurityIncident({
            incidentId: newIncidentId,
            deviceIdentifier: _deviceId,
            municipalZone: _zone,
            attackCategory: _category,
            confidenceScore: _confidence,
            timestamp: block.timestamp,
            telemetryHash: _telemetryHash
        });

        incidentHistory.push(incident);
        deviceStates[_deviceId] = DeviceStatus.Quarantined;

        emit SecurityAlertTriggered(
            newIncidentId,
            _deviceId,
            _zone,
            _category,
            _confidence,
            _telemetryHash
        );

        emit DeviceQuarantined(
            _deviceId,
            _zone,
            block.timestamp
        );

        return newIncidentId;
    }

    /**
     * @notice Reinstates a remediated IoT device back to Active operational status.
     */
    function reinstateDevice(string calldata _deviceId) external onlyAuthority {
        require(bytes(_deviceId).length > 0, "SmartCityLedger: Device identifier cannot be empty");
        deviceStates[_deviceId] = DeviceStatus.Active;
        emit DeviceReinstated(_deviceId, block.timestamp);
    }

    /**
     * @notice Returns the current operational status of a device.
     */
    function getDeviceStatus(string calldata _deviceId) external view returns (DeviceStatus) {
        return deviceStates[_deviceId];
    }

    /**
     * @notice Returns total number of security incidents recorded in the ledger.
     */
    function getIncidentCount() external view returns (uint256) {
        return incidentHistory.length;
    }

    /**
     * @notice Retrieves a specific security incident by index (0-indexed).
     */
    function getIncident(uint256 _index) external view returns (SecurityIncident memory) {
        require(_index < incidentHistory.length, "SmartCityLedger: Incident index out of bounds");
        return incidentHistory[_index];
    }

    /**
     * @notice Retrieves the most recent N incidents.
     */
    function getLatestIncidents(uint256 _limit) external view returns (SecurityIncident[] memory) {
        uint256 total = incidentHistory.length;
        uint256 count = _limit > total ? total : _limit;
        SecurityIncident[] memory latest = new SecurityIncident[](count);

        for (uint256 i = 0; i < count; i++) {
            latest[i] = incidentHistory[total - 1 - i];
        }

        return latest;
    }
}
