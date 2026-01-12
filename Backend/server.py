from flask import Flask, request, g, jsonify
from firebase.firebase_code import (
    create_user_with_profile, login_user, verify_token, get_user_profile, 
    db, get_all_users, update_user_profile, get_validators, get_user_by_public_key
)
from firebase_admin import firestore
from wallet import verify_ECDSA_msg
from functools import wraps
import datetime
import hashlib
import json
import random
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "https://campuscred-b4e19.web.app"]}})

BLOCKCHAIN_REWARD = 50

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(' ')[1]
            except IndexError:
                return jsonify({'message': 'Bearer token malformed'}), 401

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        decoded_token = verify_token(token)
        if not decoded_token:
            return jsonify({'message': 'Token is invalid!'}), 401

        user_profile = get_user_profile(decoded_token['uid'])
        if not user_profile:
            return jsonify({'message': 'User profile not found!'}), 401
            
        g.user = user_profile
        g.user['uid'] = decoded_token['uid']
        return f(*args, **kwargs)
    return decorated_function

def create_genesis_block():
    block_ref = db.collection('blocks').document('0')
    genesis_block = block_ref.get()
    if not genesis_block.exists:
        block = {
            'index': 0,
            'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat(),
            'transactions': [],
            'validator_uid': 'genesis',
            'previous_hash': '0'
        }
        block['hash'] = hash_block(block)
        block_ref.set(block)

def get_last_block():
    blocks_query = db.collection('blocks').order_by('index', direction=firestore.Query.DESCENDING).limit(1)
    docs = list(blocks_query.stream())
    if not docs:
        create_genesis_block()
        docs = list(blocks_query.stream())
    return docs[0].to_dict()

def hash_block(block):
    block_string = json.dumps(block, sort_keys=True, default=str).encode()
    return hashlib.sha256(block_string).hexdigest()

def select_validator():
    validators = get_validators()
    if not validators:
        return None

    total_stake = sum(v['staked_balance'] for v in validators)
    if total_stake == 0:
        return random.choice(validators)

    selection_point = random.uniform(0, total_stake)
    current_stake = 0
    for validator in validators:
        current_stake += validator['staked_balance']
        if current_stake >= selection_point:
            return validator
    return None

@firestore.transactional
def mine_new_block(transaction):
    create_genesis_block()
    
    last_block = get_last_block()
    validator = select_validator()

    if not validator:
        raise Exception("No validators available to mine the block.")

    pending_txs_query = db.collection('pending_transactions').stream()
    pending_txs_docs = list(pending_txs_query)

    new_block = {
        'index': last_block['index'] + 1,
        'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'transactions': [],
        'validator_uid': validator['uid'],
        'previous_hash': last_block['hash']
    }

    validated_txs_details = []
    failed_txs_refs = []

    for tx_doc in pending_txs_docs:
        tx_data = tx_doc.to_dict()
        sender_ref = db.collection('users').document(tx_data['sender_uid'])
        sender_snapshot = sender_ref.get(transaction=transaction)
        sender_data = sender_snapshot.to_dict()

        is_valid = (
            verify_ECDSA_msg(sender_data['public_key'], tx_data['signature'], tx_data['message']) and
            sender_data['balance'] >= tx_data['amount']
        )

        if is_valid:
            recipient_ref = db.collection('users').document(tx_data['recipient_uid'])
            transaction.update(sender_ref, {'balance': firestore.Increment(-tx_data['amount'])})
            transaction.update(recipient_ref, {'balance': firestore.Increment(tx_data['amount'])})
            
            tx_data['status'] = 'validated'
            validated_txs_details.append(tx_data)
        else:
            tx_data['status'] = 'failed'
            failed_txs_refs.append(tx_doc.reference)
    
    new_block['transactions'] = validated_txs_details
    new_block['hash'] = hash_block(new_block)

    block_ref = db.collection('blocks').document(str(new_block['index']))
    transaction.set(block_ref, new_block)

    if validated_txs_details:
        validator_ref = db.collection('users').document(validator['uid'])
        transaction.update(validator_ref, {'balance': firestore.Increment(BLOCKCHAIN_REWARD)})

    for tx_ref in pending_txs_docs:
        if tx_ref not in failed_txs_refs:
            transaction.delete(tx_ref)
        else:
            transaction.update(tx_ref, {'status': 'failed'})

@app.route("/")
def hello_world():
  return "<h1>Hello, World!</h1>"

@app.route("/create-user", methods=["POST"])
def create_user():
    data = request.get_json()
    if not data or not data.get('publicKey'):
        return jsonify({"message": "Request must include user details and publicKey"}), 400

    new_user = {
        "name": data.get('name'),
        "email": data.get('email'),
        "password": data.get('password'),
        "role": data.get('role'),
        "college_id": data.get('collegeId'),
        "department": data.get('department'),
        "public_key": data.get('publicKey'),
        "balance": 500,
        "staked_balance": 0,
        "is_validator": False,
        "nonce": 0
    }
    
    try:
        user_id = create_user_with_profile(new_user)
        return jsonify({"message": "User created successfully", "uid": user_id}), 201
    except Exception as e:
        return jsonify({"message": "Failed to create user: " + str(e)}), 401

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password required"}), 400

    result = login_user(email, password)
    if not result:
        return jsonify({"message": "Invalid credentials"}), 401

    return jsonify({"message": "Login successful", "idToken": result["idToken"]}), 200

@app.route("/profile")
@login_required
def profile():
    return jsonify(g.user)

@app.route("/users")
@login_required
def users():
    users_list = get_all_users()
    if users_list is None:
        return jsonify({"message": "Failed to retrieve users"}), 500
    return jsonify(users_list)

@app.route("/stake", methods=["POST"])
@login_required
def stake():
    data = request.get_json()
    amount = data.get('amount')

    try:
        amount = int(amount)
        if amount <= 0:
            raise ValueError("Amount must be positive")
    except (ValueError, TypeError):
        return jsonify({"message": "Invalid amount"}), 400

    try:
        @firestore.transactional
        def stake_transaction(transaction):
            user_ref = db.collection('users').document(g.user['uid'])
            user_snapshot = user_ref.get(transaction=transaction)
            current_balance = user_snapshot.get('balance', 0)

            if current_balance < amount:
                raise Exception("Insufficient funds to stake")

            transaction.update(user_ref, {
                'balance': firestore.Increment(-amount),
                'staked_balance': firestore.Increment(amount),
                'is_validator': True
            })

        with db.transaction() as transaction:
            stake_transaction(transaction)
        
        return jsonify({"message": f"Successfully staked {amount} coins."}), 200
    except Exception as e:
        import traceback
        print("--- STAKING FAILED ---")
        traceback.print_exc()
        print("----------------------")
        return jsonify({"message": f"Staking failed: {str(e)}"}), 500

@app.route("/unstake", methods=["POST"])
@login_required
def unstake():
    data = request.get_json()
    amount = data.get('amount')

    try:
        amount = int(amount)
        if amount <= 0:
            raise ValueError("Amount must be positive")
    except (ValueError, TypeError):
        return jsonify({"message": "Invalid amount"}), 400

    try:
        @firestore.transactional
        def unstake_transaction(transaction):
            user_ref = db.collection('users').document(g.user['uid'])
            user_snapshot = user_ref.get(transaction=transaction)
            staked_balance = user_snapshot.get('staked_balance', 0)

            if staked_balance < amount:
                raise Exception("Insufficient staked balance")
            
            new_staked_balance = staked_balance - amount
            is_validator = new_staked_balance > 0

            transaction.update(user_ref, {
                'balance': firestore.Increment(amount),
                'staked_balance': new_staked_balance,
                'is_validator': is_validator
            })

        with db.transaction() as transaction:
            unstake_transaction(transaction)

        return jsonify({"message": f"Successfully unstaked {amount} coins."}), 200
    except Exception as e:
        import traceback
        print("--- UNSTAKING FAILED ---")
        traceback.print_exc()
        print("------------------------")
        return jsonify({"message": f"Unstaking failed: {str(e)}"}), 500

@firestore.transactional
def submit_transaction_and_update_nonce(transaction, sender_ref, recipient_data, amount, signature, message):
    sender_snapshot = sender_ref.get(transaction=transaction)
    sender_data = sender_snapshot.to_dict()

    if message.get('nonce') != sender_data.get('nonce', 0):
        raise Exception("Invalid nonce.")

    if sender_data.get('balance', 0) < amount:
        raise Exception("Insufficient funds.")

    tx_ref = db.collection('pending_transactions').document()
    transaction.set(tx_ref, {
        'sender_uid': sender_ref.id,
        'recipient_uid': recipient_data['uid'],
        'sender_name': sender_data['name'],
        'recipient_name': recipient_data['name'],
        'amount': amount,
        'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'status': 'pending',
        'signature': signature,
        'message': message
    })

    transaction.update(sender_ref, {'nonce': firestore.Increment(1)})

@app.route("/transactions/send", methods=["POST"])
@login_required
def send_transaction():
    data = request.get_json()
    message = data.get('message')
    signature = data.get('signature')
    
    if not all([data, message, signature, isinstance(message, dict), 
                'recipientId' in message, 'amount' in message, 'nonce' in message]):
        return jsonify({"message": "Invalid request format"}), 400
    
    recipient_college_id = message.get('recipientId')
    amount = message.get('amount')

    if not verify_ECDSA_msg(g.user['public_key'], signature, message):
        return jsonify({"message": "Signature verification failed"}), 403

    try:
        amount = int(amount)
        if amount <= 0:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({"message": "Invalid amount"}), 400

    recipient_query = db.collection('users').where('college_id', '==', recipient_college_id).limit(1).stream()
    recipient = next(iter(recipient_query), None)
    
    if not recipient:
        return jsonify({"message": "Recipient not found"}), 404

    recipient_data = recipient.to_dict()
    recipient_data['uid'] = recipient.id
    
    if g.user['uid'] == recipient_data['uid']:
        return jsonify({"message": "Cannot send credits to yourself"}), 400

    try:
        with db.transaction() as transaction:
            sender_ref = db.collection('users').document(g.user['uid'])
            submit_transaction_and_update_nonce(transaction, sender_ref, recipient_data, amount, signature, message)
        
        # After submitting, attempt to mine a new block
        try:
            validators = get_validators()
            if validators:
                with db.transaction() as mining_transaction:
                    mine_new_block(mining_transaction)
                return jsonify({"message": "Transaction validated and new block mined."}), 201
            else:
                return jsonify({"message": "Transaction submitted and is pending. No validators available."}), 202
        except Exception as e:
            # If mining fails, it's a critical backend error.
            return jsonify({"message": f"Block mining failed: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"message": f"Transaction submission failed: {e}"}), 500

@app.route("/transactions")
@login_required
def get_transactions():
    user_uid = g.user['uid']
    all_transactions = []
    
    blocks_query = db.collection('blocks').order_by('index', direction=firestore.Query.DESCENDING).stream()

    for block in blocks_query:
        block_data = block.to_dict()
        for tx in block_data.get('transactions', []):
            if tx.get('sender_uid') == user_uid or tx.get('recipient_uid') == user_uid:
                all_transactions.append(tx)

    # Also include pending transactions for the user
    pending_sent_query = db.collection('pending_transactions').where('sender_uid', '==', user_uid).stream()
    pending_received_query = db.collection('pending_transactions').where('recipient_uid', '==', user_uid).stream()

    for tx in pending_sent_query:
        all_transactions.append(tx.to_dict())
    for tx in pending_received_query:
        all_transactions.append(tx.to_dict())

    all_transactions.sort(key=lambda x: x['timestamp'], reverse=True)
    
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    start = (page - 1) * limit
    end = start + limit
    
    return jsonify({
        "transactions": all_transactions[start:end],
        "total": len(all_transactions)
    })

if __name__ == '__main__':
    app.run(debug=True)
