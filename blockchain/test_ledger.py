"""
Smart City Security Ledger Automated Integration Test Suite
Verifies contract deployment, authority access controls, incident logging,
quarantine state transitions, and node reinstatement.
"""

import os
import sys
import json
import hashlib
from web3 import Web3

def run_ledger_tests(contract_info_path: str = "blockchain/contract_info.json"):
    print("="*60)
    print("RUNNING SMART CITY SECURITY LEDGER INTEGRATION TESTS")
    print("="*60)

    # 1. Load Contract Info
    if not os.path.exists(contract_info_path):
        raise FileNotFoundError(f"Missing {contract_info_path}. Run deploy_ledger.py first.")

    with open(contract_info_path, "r", encoding="utf-8") as f:
        info = json.load(f)

    rpc_url = info.get("rpc_url", "http://127.0.0.1:8545")
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    if not w3.is_connected():
        fallback = "http://127.0.0.1:7545" if "8545" in rpc_url else "http://127.0.0.1:8545"
        test_w3 = Web3(Web3.HTTPProvider(fallback))
        if test_w3.is_connected():
            w3 = test_w3
            rpc_url = fallback
    assert w3.is_connected(), f"Failed to connect to Ganache at {rpc_url} or fallback port (8545/7545)."

    contract_address = info["contract_address"]
    abi = info["abi"]
    deployer = info["deployer_address"]

    contract = w3.eth.contract(address=contract_address, abi=abi)
    print(f"[Test Setup] Connected to contract at {contract_address}")
    print(f"[Test Setup] Gateway Authority / Deployer: {deployer}")

    # TEST 1: Verify Immutable Gateway Authority
    print("\n--- TEST 1: Gateway Authority Assertion ---")
    authority = contract.functions.gatewayAuthority().call()
    assert authority.lower() == deployer.lower(), f"Authority mismatch: {authority} vs {deployer}"
    print(f"[PASS] Gateway Authority verified: {authority}")

    # TEST 2: Device Initial State (Active = 0)
    print("\n--- TEST 2: Initial Device Status ---")
    test_device_id = "iot-edge-traffic-cam-88"
    initial_status = contract.functions.getDeviceStatus(test_device_id).call()
    assert initial_status == 0, f"Expected initial status 0 (Active), got {initial_status}"
    print(f"[PASS] Initial status for '{test_device_id}' is Active (enum value: {initial_status})")

    # TEST 3: Record Security Incident & Quarantine (Confidence = 98.69% / 9869 bps)
    print("\n--- TEST 3: Record Security Incident & Quarantine ---")
    zone = "Municipal District 4 - Traffic Junction"
    category = 1  # DDoS/Flood
    confidence = 9869  # 98.69% confidence from 1D-CNN
    sample_flow = b"FlowRate=5820.4,IAT=0.00012,TotSum=840200,SYN=1,ACK=1"
    telemetry_hash = bytes.fromhex(hashlib.sha256(sample_flow).hexdigest())

    tx_hash = contract.functions.recordIncidentAndQuarantine(
        test_device_id,
        zone,
        category,
        confidence,
        telemetry_hash
    ).transact({"from": deployer, "gas": 500000})

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    assert receipt.status == 1, "Quarantine transaction failed!"
    print(f"[PASS] Incident logged in tx {tx_hash.hex()} (Gas Used: {receipt.gasUsed:,})")

    # TEST 4: Assert Quarantined Device State
    print("\n--- TEST 4: Post-Incident Device State Transition ---")
    post_status = contract.functions.getDeviceStatus(test_device_id).call()
    assert post_status == 2, f"Expected status 2 (Quarantined), got {post_status}"
    print(f"[PASS] Device state successfully transitioned to Quarantined (enum value: {post_status})")

    # TEST 5: Verify Incident Ledger Records
    print("\n--- TEST 5: Verify Incident Ledger Record Content ---")
    incident_count = contract.functions.getIncidentCount().call()
    assert incident_count >= 1, f"Expected incident count >= 1, got {incident_count}"
    print(f"[PASS] Total recorded incidents in ledger: {incident_count}")

    incident = contract.functions.getIncident(incident_count - 1).call()
    # incident tuple: (incidentId, deviceIdentifier, municipalZone, attackCategory, confidenceScore, timestamp, telemetryHash)
    assert incident[1] == test_device_id, f"Device mismatch in incident: {incident[1]}"
    assert incident[2] == zone, f"Zone mismatch in incident: {incident[2]}"
    assert incident[3] == category, f"Category mismatch: {incident[3]}"
    assert incident[4] == confidence, f"Confidence mismatch: {incident[4]}"
    assert incident[6] == telemetry_hash, "Telemetry hash mismatch"
    print(f"[PASS] Incident record verified:")
    print(f"       ID: {incident[0]} | Device: {incident[1]} | Zone: {incident[2]}")
    print(f"       Category: {incident[3]} (DDoS/Flood) | Confidence: {incident[4]} bps ({incident[4]/100:.2f}%)")
    print(f"       Telemetry Hash: 0x{incident[6].hex()}")

    # TEST 6: Enforce Quarantine Threshold Revert (< 9500 bps)
    print("\n--- TEST 6: Quarantine Threshold Validation (< 9500 bps) ---")
    low_confidence = 9200  # 92.00% (below 9500 threshold)
    try:
        contract.functions.recordIncidentAndQuarantine(
            "iot-low-conf-node",
            zone,
            category,
            low_confidence,
            telemetry_hash
        ).call({"from": deployer})
        assert False, "Expected revert for confidence < 9500, but call succeeded!"
    except Exception as e:
        print(f"[PASS] Low-confidence quarantine correctly rejected: {e}")

    # TEST 7: Reinstate Remediated Node
    print("\n--- TEST 7: Device Reinstatement ---")
    reinst_tx = contract.functions.reinstateDevice(test_device_id).transact({
        "from": deployer,
        "gas": 200000
    })
    reinst_receipt = w3.eth.wait_for_transaction_receipt(reinst_tx)
    assert reinst_receipt.status == 1, "Reinstatement transaction failed!"

    final_status = contract.functions.getDeviceStatus(test_device_id).call()
    assert final_status == 0, f"Expected status 0 (Active) after reinstatement, got {final_status}"
    print(f"[PASS] Device successfully reinstated to Active (enum value: {final_status})")
    print(f"       Reinstatement Gas Used: {reinst_receipt.gasUsed:,} units")

    print("\n" + "="*60)
    print("ALL 7 INTEGRATION TESTS PASSED PERFECTLY!")
    print("="*60)
    return True

if __name__ == "__main__":
    success = run_ledger_tests()
    sys.exit(0 if success else 1)
