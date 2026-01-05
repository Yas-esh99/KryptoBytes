import time
import hashlib
import json
import requests
import base64
from flask import Flask, request, jsonify
from multiprocessing import Process, Queue
import ecdsa

from miner_config import MINER_ADDRESS, MINER_NODE_URL, PEER_NODES

node = Flask(__name__)


class Block:
    def __init__(self, index, timestamp, data, previous_hash):
        """Returns a new Block object. Each block is "chained" to its previous
        by calling its unique hash.

        Args:
            index (int): Block number.
            timestamp (int): Block creation timestamp.
            data (str): Data to be sent.
            previous_hash(str): String representing previous block unique hash.
        """
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previous_hash = previous_hash
        self.hash = self.hash_block()

    def hash_block(self):
        """Creates the unique hash for the block. It uses sha256."""
        sha = hashlib.sha256()
        sha.update((str(self.index) + str(self.timestamp) + str(self.data) + str(self.previous_hash)).encode('utf-8'))
        return sha.hexdigest()

    def to_dict(self):
        """Convert block to dictionary for serialization"""
        return {
            'index': self.index,
            'timestamp': self.timestamp,
            'data': self.data,
            'previous_hash': self.previous_hash,
            'hash': self.hash
        }

    @staticmethod
    def from_dict(block_dict):
        """Create block from dictionary"""
        block = Block(
            block_dict['index'],
            block_dict['timestamp'],
            block_dict['data'],
            block_dict['previous_hash']
        )
        return block


def create_genesis_block():
    """To create each block, it needs the hash of the previous one. First
    block has no previous, so it must be created manually (with index zero
     and arbitrary previous hash)"""
    return Block(0, time.time(), {
        "proof-of-work": 9,
        "transactions": None},
        "0")


# Node's blockchain copy
BLOCKCHAIN = [create_genesis_block()]

""" Stores the transactions that this node has in a list.
If the node you sent the transaction adds a block
it will get accepted, but there is a chance it gets
discarded and your transaction goes back as if it was never
processed"""
NODE_PENDING_TRANSACTIONS = []


def proof_of_work(last_proof, blockchain):
    """Creates a variable that we will use to find our next proof of work"""
    incrementer = last_proof + 1
    start_time = time.time()
    check_interval = 60
    last_check = start_time
    
    while not (incrementer % 7919 == 0 and incrementer % last_proof == 0):
        incrementer += 1
        current_time = time.time()
        
        # Check if any node found the solution every 60 seconds
        if current_time - last_check >= check_interval:
            last_check = current_time
            # If any other node got the proof, stop searching
            new_blockchain = consensus(blockchain)
            if new_blockchain:
                # (False: another node got proof first, new blockchain)
                return False, new_blockchain
    
    # Once that number is found, we can return it as a proof of our work
    return incrementer, blockchain


def mine(blockchain_queue, blockchain, node_pending_transactions):
    """Mining is the only way that new coins can be created.
    In order to prevent too many coins to be created, the process
    is slowed down by a proof of work algorithm.
    """
    BLOCKCHAIN = blockchain
    NODE_PENDING_TRANSACTIONS = node_pending_transactions
    
    while True:
        try:
            # Get the last proof of work
            last_block = BLOCKCHAIN[-1]
            last_proof = last_block.data['proof-of-work']
            
            # Find the proof of work for the current block being mined
            proof = proof_of_work(last_proof, BLOCKCHAIN)
            
            # If we didn't guess the proof, start mining again
            if not proof[0]:
                # Update blockchain and save it to file
                BLOCKCHAIN = proof[1]
                blockchain_queue.put([b.to_dict() for b in BLOCKCHAIN])
                continue
            else:
                # Once we find a valid proof of work, we know we can mine a block so
                # we reward the miner by adding a transaction
                try:
                    # First we load all pending transactions sent to the node server
                    response = requests.get(
                        url=MINER_NODE_URL + '/txion',
                        params={'update': MINER_ADDRESS},
                        timeout=5
                    )
                    NODE_PENDING_TRANSACTIONS = response.json()
                except Exception as e:
                    print(f"Error fetching transactions: {e}")
                    NODE_PENDING_TRANSACTIONS = []
                
                # Then we add the mining reward
                NODE_PENDING_TRANSACTIONS.append({
                    "from": "network",
                    "to": MINER_ADDRESS,
                    "amount": 1
                })
                
                # Now we can gather the data needed to create the new block
                new_block_data = {
                    "proof-of-work": proof[0],
                    "transactions": list(NODE_PENDING_TRANSACTIONS)
                }
                new_block_index = last_block.index + 1
                new_block_timestamp = time.time()
                last_block_hash = last_block.hash
                
                # Empty transaction list
                NODE_PENDING_TRANSACTIONS = []
                
                # Now create the new block
                mined_block = Block(new_block_index, new_block_timestamp, new_block_data, last_block_hash)
                BLOCKCHAIN.append(mined_block)
                
                # Let the client know this node mined a block
                print(json.dumps({
                    "index": new_block_index,
                    "timestamp": str(new_block_timestamp),
                    "data": new_block_data,
                    "hash": last_block_hash
                }, sort_keys=True, indent=2))
                
                blockchain_queue.put([b.to_dict() for b in BLOCKCHAIN])
                
                try:
                    requests.get(
                        url=MINER_NODE_URL + '/blocks',
                        params={'update': MINER_ADDRESS},
                        timeout=5
                    )
                except Exception as e:
                    print(f"Error notifying node: {e}")
                    
        except Exception as e:
            print(f"Mining error: {e}")
            time.sleep(1)


def find_new_chains():
    """Get the blockchains of every other node"""
    other_chains = []
    for node_url in PEER_NODES:
        try:
            # Get their chains using a GET request
            response = requests.get(url=node_url + "/blocks", timeout=5)
            block = response.json()
            # Verify other node block is correct
            validated = validate_blockchain(block)
            if validated:
                # Add it to our list
                other_chains.append(block)
        except Exception as e:
            print(f"Error fetching chain from {node_url}: {e}")
    return other_chains


def consensus(blockchain):
    """Get the blocks from other nodes"""
    other_chains = find_new_chains()
    # If our chain isn't longest, then we store the longest chain
    BLOCKCHAIN = blockchain
    longest_chain = BLOCKCHAIN
    for chain in other_chains:
        if len(longest_chain) < len(chain):
            longest_chain = chain
    # If the longest chain wasn't ours, then we set our chain to the longest
    if longest_chain == BLOCKCHAIN:
        # Keep searching for proof
        return False
    else:
        # Give up searching proof, update chain and start over again
        BLOCKCHAIN = longest_chain
        return BLOCKCHAIN


def validate_blockchain(block):
    """Validate the submitted chain. If hashes are not correct, return false
    block(str): json
    """
    return True


@node.route('/blocks', methods=['GET'])
def get_blocks():
    """Load current blockchain. Only you should update your blockchain"""
    global BLOCKCHAIN
    
    if request.args.get("update") == MINER_ADDRESS:
        # Check if there's an update from the mining process
        if not blockchain_queue.empty():
            blockchain_dicts = blockchain_queue.get()
            BLOCKCHAIN = [Block.from_dict(b) for b in blockchain_dicts]
    
    chain_to_send = BLOCKCHAIN
    # Converts our blocks into dictionaries so we can send them as json objects later
    chain_to_send_json = []
    for block in chain_to_send:
        block_dict = {
            "index": str(block.index),
            "timestamp": str(block.timestamp),
            "data": str(block.data),
            "hash": block.hash
        }
        chain_to_send_json.append(block_dict)

    # Send our chain to whomever requested it
    return jsonify(chain_to_send_json)


@node.route('/txion', methods=['GET', 'POST'])
def transaction():
    """Each transaction sent to this node gets validated and submitted.
    Then it waits to be added to the blockchain. Transactions only move
    coins, they don't create it.
    """
    global NODE_PENDING_TRANSACTIONS
    
    if request.method == 'POST':
        # On each new POST request, we extract the transaction data
        new_txion = request.get_json()
        # Then we add the transaction to our list
        if validate_signature(new_txion['from'], new_txion['signature'], new_txion['message']):
            NODE_PENDING_TRANSACTIONS.append(new_txion)
            # Because the transaction was successfully submitted, we log it to our console
            print("New transaction")
            print("FROM: {0}".format(new_txion['from']))
            print("TO: {0}".format(new_txion['to']))
            print("AMOUNT: {0}\n".format(new_txion['amount']))
            # Then we let the client know it worked out
            return "Transaction submission successful\n"
        else:
            return "Transaction submission failed. Wrong signature\n"
    # Send pending transactions to the mining process
    elif request.method == 'GET' and request.args.get("update") == MINER_ADDRESS:
        pending = NODE_PENDING_TRANSACTIONS.copy()
        # Empty transaction list
        NODE_PENDING_TRANSACTIONS = []
        return jsonify(pending)


def validate_signature(public_key, signature, message):
    """Verifies if the signature is correct. This is used to prove
    it's you (and not someone else) trying to do a transaction with your
    address. Called when a user tries to submit a new transaction.
    """
    try:
        public_key_decoded = (base64.b64decode(public_key)).hex()
        signature_decoded = base64.b64decode(signature)
        vk = ecdsa.VerifyingKey.from_string(bytes.fromhex(public_key_decoded), curve=ecdsa.SECP256k1)
        return vk.verify(signature_decoded, message.encode())
    except Exception as e:
        print(f"Signature validation error: {e}")
        return False


def welcome_msg():
    print("""       =========================================
        SIMPLE COIN v1.0.0 - BLOCKCHAIN SYSTEM
       =========================================

        You can find more help at: https://github.com/cosme12/SimpleCoin
        Make sure you are using the latest version or you may end in
        a parallel chain.

""")


# Global queue for blockchain updates
blockchain_queue = None


if __name__ == '__main__':
    welcome_msg()
    
    # Create queue for communication between processes
    blockchain_queue = Queue()
    
    # Start mining process
    miner_process = Process(
        target=mine,
        args=(blockchain_queue, BLOCKCHAIN, NODE_PENDING_TRANSACTIONS)
    )
    miner_process.start()
    
    # Start Flask server in the main process
    try:
        node.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
    except KeyboardInterrupt:
        print("\nShutting down...")
        miner_process.terminate()
        miner_process.join()