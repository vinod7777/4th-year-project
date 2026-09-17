from web3 import Web3

w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))
acct = w3.eth.accounts[0]
bal_wei = w3.eth.get_balance(acct)
initial_wei = 100 * 10**18
deducted_wei = initial_wei - bal_wei

print("=" * 65)
print("EXACT ACCOUNT BALANCE PROOF (Down to 18 Decimals)")
print("=" * 65)
print(f"Account Address:    {acct}")
print(f"Starting Balance:   100.000000000000000000 ETH ({initial_wei:,} Wei)")
print(f"Current Balance:     {w3.from_wei(bal_wei, 'ether')} ETH ({bal_wei:,} Wei)")
print("-" * 65)
print(f"TOTAL ETH DEDUCTED:   {w3.from_wei(deducted_wei, 'ether')} ETH ({deducted_wei:,} Wei)")
print("=" * 65)
