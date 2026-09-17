"""
Smart City Security Ledger Deployment Script
Compiles and deploys SmartCitySecurityLedger.sol onto local Ganache testnet (127.0.0.1:8545).
Exports deployment details and ABI to blockchain/contract_info.json.
"""

import os
import sys
import json
from web3 import Web3
import solcx

def compile_and_deploy(
    sol_file: str = "blockchain/SmartCitySecurityLedger.sol",
    rpc_url: str = None,
    output_json: str = "blockchain/contract_info.json"
):
    print("="*60)
    print("DEPLOYING SMART CITY SECURITY LEDGER TO EVM TESTNET")
    print("="*60)

    # Auto-detect Ganache port (try 8545, then 7545)
    w3 = None
    candidate_urls = [rpc_url] if rpc_url else ["http://127.0.0.1:8545", "http://127.0.0.1:7545"]
    
    for candidate in candidate_urls:
        test_w3 = Web3(Web3.HTTPProvider(candidate))
        if test_w3.is_connected():
            w3 = test_w3
            rpc_url = candidate
            break

    if not w3 or not w3.is_connected():
        raise ConnectionError(
            f"Could not connect to Ganache at any of: {candidate_urls}.\n"
            "Please ensure Ganache is running on port 8545 or 7545."
        )
        
    
    chain_id = w3.eth.chain_id
    deployer = w3.eth.accounts[0]
    deployer_balance = w3.eth.get_balance(deployer)
    print(f"[Web3] Connected successfully to {rpc_url}")
    print(f"       Chain ID: {chain_id}")
    print(f"       Deployer Account: {deployer}")
    print(f"       Balance: {w3.from_wei(deployer_balance, 'ether')} ETH")

    # 2. Compile Solidity Contract
    print(f"\n[Solc] Compiling {sol_file} using Solidity 0.8.20...")
    solcx.set_solc_version_pragma("^0.8.20")
    
    with open(sol_file, "r", encoding="utf-8") as f:
        source_code = f.read()

    compiled = solcx.compile_standard({
        "language": "Solidity",
        "sources": {
            "SmartCitySecurityLedger.sol": {"content": source_code}
        },
        "settings": {
            "optimizer": {"enabled": True, "runs": 200},
            "evmVersion": "paris",
            "outputSelection": {
                "*": {
                    "*": ["abi", "metadata", "evm.bytecode", "evm.sourceMap"]
                }
            }
        }
    }, solc_version="0.8.20")

    contract_interface = compiled["contracts"]["SmartCitySecurityLedger.sol"]["SmartCitySecurityLedger"]
    abi = contract_interface["abi"]
    bytecode = contract_interface["evm"]["bytecode"]["object"]

    print(f"[Solc] Compilation succeeded!")
    print(f"       Bytecode length: {len(bytecode) // 2} bytes")
    print(f"       ABI functions count: {len([x for x in abi if x.get('type') == 'function'])}")

    # 3. Deploy Contract
    print(f"\n[Deploy] Submitting deployment transaction from {deployer}...")
    ContractFactory = w3.eth.contract(abi=abi, bytecode=bytecode)
    tx_hash = ContractFactory.constructor().transact({
        "from": deployer,
        "gas": 3000000
    })

    print(f"[Deploy] Transaction submitted! Hash: {tx_hash.hex()}")
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    contract_address = tx_receipt.contractAddress
    print(f"[Deploy] Contract confirmed at block #{tx_receipt.blockNumber}!")
    print(f"       Contract Address: {contract_address}")
    print(f"       Gas Used: {tx_receipt.gasUsed:,} units")

    # 4. Verify Gateway Authority
    deployed_contract = w3.eth.contract(address=contract_address, abi=abi)
    authority = deployed_contract.functions.gatewayAuthority().call()
    assert authority.lower() == deployer.lower(), "Mismatch between deployer and gateway authority!"
    print(f"[Verify] Immutable gateway authority verified: {authority}")

    # 5. Export Contract Artifacts
    os.makedirs(os.path.dirname(output_json), exist_ok=True)
    deployment_info = {
        "network": "Ganache Local EVM",
        "rpc_url": rpc_url,
        "chain_id": chain_id,
        "contract_name": "SmartCitySecurityLedger",
        "contract_address": contract_address,
        "deployer_address": deployer,
        "gateway_authority": authority,
        "transaction_hash": tx_hash.hex(),
        "block_number": tx_receipt.blockNumber,
        "gas_used": tx_receipt.gasUsed,
        "cumulative_gas_used": tx_receipt.cumulativeGasUsed,
        "abi": abi
    }

    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(deployment_info, f, indent=2)

    print(f"\n[Export] Saved deployment artifact to: {output_json} ({os.path.getsize(output_json):,} bytes)")
    print("="*60)
    print("SMART CONTRACT DEPLOYMENT COMPLETE & VERIFIED")
    print("="*60)
    return deployment_info

if __name__ == "__main__":
    compile_and_deploy()
