from flask import Flask, request, g, jsonify
from firebase.firebase_code import create_user_with_profile, login_user, verify_token, get_user_profile, db, get_all_users
from firebase_admin import firestore
from wallet import generate_ECDSA_keys
from functools import wraps
import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "https://campuscred-b4e19.web.app"}})
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(' ')[1]
            except IndexError:
                return {'message': 'Bearer token malformed'}, 401


        if not token:
            return {'message': 'Token is missing!'}, 401

        decoded_token = verify_token(token)
        if not decoded_token:
            return {'message': 'Token is invalid!'}, 401

        # Fetch the full user profile from Firestore and store it in g
        user_profile = get_user_profile(decoded_token['uid'])
        if not user_profile:
            return {'message': 'User profile not found!'}, 401
            
        g.user = user_profile
        return f(*args, **kwargs)
    return decorated_function

@app.route("/")
def hello_world():
  return "<h1>Hello, World!</h1>"

@app.route("/create-user", methods=["POST"])
def create_user():
  
  data = request.get_json()
  if not data:
      return {"message": "JSON body required"}, 400

  keys = generate_ECDSA_keys()
  
  initial_balance = 50
  
  new_user = {
    "name": data.get('name'),
    "email": data.get('email'),
    "password": data.get('password'),
    "role": data.get('role'),
    "college_id": data.get('collegeId'),
    "department": data.get('department'),
    "public_key": keys[1],
    "private_key": keys[0],
    "balance": initial_balance
  }
  
  try:
    create_user_with_profile(new_user)
  except Exception as e:
    return {"message": "Failed to create user: " + str(e)}, 401

  
  return {"message": "User created successfully"}, 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return {"message": "JSON body required"}, 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return {"message": "Email and password required"}, 400

    result = login_user(email, password)

    if not result:
        return {"message": "Invalid credentials"}, 401


    return jsonify({
        "message": "Login successful",
        "idToken": result["idToken"],
    }), 200

@app.route("/profile")
@login_required
def profile():
    # g.user is now the full user profile from Firestore
    return jsonify(g.user)

@app.route("/users")
@login_required
def users():
    users = get_all_users()
    if users is None:
        return jsonify({"message": "Failed to retrieve users"}), 500
    return jsonify(users)

@firestore.transactional

def update_balances_transactional(transaction, sender_ref, recipient_ref, amount, sender_uid, recipient_uid, sender_name, recipient_name):

    sender_snapshot = sender_ref.get(transaction=transaction)

    current_balance = sender_snapshot.get('balance')



    if current_balance < amount:

        raise Exception("Insufficient funds")



    # Update balances

    transaction.update(sender_ref, {'balance': current_balance - amount})

    transaction.update(recipient_ref, {'balance': firestore.Increment(amount)})



    # Record the transaction

    transaction.set(db.collection('transactions').document(), {

        'sender_uid': sender_uid,

        'recipient_uid': recipient_uid,

        'sender_name': sender_name,

        'recipient_name': recipient_name,

        'amount': amount,

        'timestamp': datetime.datetime.now(datetime.timezone.utc)

    })



@app.route("/transactions/send", methods=["POST"])

@login_required

def send_transaction():

    data = request.get_json()

    recipient_college_id = data.get('recipientId')

    amount = data.get('amount')



    if not recipient_college_id or not amount:

        return jsonify({"message": "Recipient ID and amount are required"}), 400



    try:

        amount = int(amount)

        if amount <= 0:

            raise ValueError("Amount must be positive")

    except (ValueError, TypeError):

        return jsonify({"message": "Invalid amount"}), 400



    sender_uid = g.user['uid']

    sender_balance = g.user['balance']



    if sender_balance < amount:

        return jsonify({"message": "Insufficient funds"}), 400



    # Find recipient

    users_ref = db.collection('users')

    recipient_query = users_ref.where('college_id', '==', recipient_college_id).limit(1).stream()

    

    recipient = None

    for r in recipient_query:

        recipient = r

        break

    

    if not recipient:

        return jsonify({"message": "Recipient not found"}), 404



    recipient_data = recipient.to_dict()

    recipient_uid = recipient.id



    if sender_uid == recipient_uid:

        return jsonify({"message": "Cannot send credits to yourself"}), 400



    try:

        transaction = db.transaction()

        sender_ref = users_ref.document(sender_uid)

        recipient_ref = users_ref.document(recipient_uid)

        

        update_balances_transactional(

            transaction, 

            sender_ref, 

            recipient_ref, 

            amount, 

            sender_uid, 

            recipient_uid, 

            g.user['name'], 

            recipient_data['name']

        )

        

        return jsonify({"message": "Transaction successful"}), 200

    except Exception as e:

        return jsonify({"message": f"Transaction failed: {e}"}), 500





@app.route("/transactions")

@login_required

def get_transactions():

    user_uid = g.user['uid']

    

    # Query for transactions where the user is the sender OR the recipient

    sent_query = db.collection('transactions').where('sender_uid', '==', user_uid)

    received_query = db.collection('transactions').where('recipient_uid', '==', user_uid)



    try:

        sent_transactions = [doc.to_dict() for doc in sent_query.get()]

        received_transactions = [doc.to_dict() for doc in received_query.get()]

    except Exception as e:

        return jsonify({"message": f"Failed to retrieve transactions: {e}"}), 500



    # Combine and sort by timestamp

    all_transactions = sorted(

        sent_transactions + received_transactions,

        key=lambda x: x['timestamp'],

        reverse=True

    )

    

    # Simple pagination

    page = request.args.get('page', 1, type=int)

    limit = request.args.get('limit', 10, type=int)

    start = (page - 1) * limit

    end = start + limit

    

    return jsonify({

        "transactions": all_transactions[start:end],

        "total": len(all_transactions)

    })



@firestore.transactional

def mine_coins_transactional(transaction, user_ref):

    transaction.update(user_ref, {'balance': firestore.Increment(10)})



@app.route("/mine", methods=["GET"])

@login_required

def mine():

    try:

        user_uid = g.user['uid']

        user_ref = db.collection('users').document(user_uid)



        transaction = db.transaction()

        mine_coins_transactional(transaction, user_ref)



        # Re-fetch the user's profile to get the updated balance

        updated_user_profile = get_user_profile(user_uid)

        

        return jsonify({

            "message": "Successfully mined 10 Leafcoin!",

            "new_balance": updated_user_profile['balance']

        }), 200

    except Exception as e:

        return jsonify({"message": f"Mining failed: {e}"}), 500
