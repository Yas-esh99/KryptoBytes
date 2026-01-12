import os
import json
import firebase_admin
from firebase_admin import credentials, auth, firestore
import requests

# --- SECURE INITIALIZATION ---
base_path = os.path.dirname(__file__)
firebase_creds_json = os.environ.get('FIREBASE_CONFIG')

if not firebase_admin._apps:
    if firebase_creds_json:
        cred_dict = json.loads(firebase_creds_json)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
    else:
        json_path = os.path.join(
            base_path,
            "krytpbytes-firebase-adminsdk-fbsvc-b97802092a.json"
        )
        cred = credentials.Certificate(json_path)
        firebase_admin.initialize_app(cred)

db = firestore.client()

FIREBASE_WEB_API_KEY = "AIzaSyAZmYb545gnsmRE25spJDSt1xc4WthWTfg"
# ------------------------------


# ============================
# AUTH & USER FUNCTIONS
# ============================

def create_user_with_profile(user_data):
    email = user_data["email"]
    password = user_data["password"]

    # Create Firebase Auth user
    user = auth.create_user(
        email=email,
        password=password
    )

    uid = user.uid

    # Remove password before storing
    user_data.pop("password", None)
    user_data["uid"] = uid
    user_data["staked_balance"] = 0
    user_data["is_validator"] = False
    user_data["nonce"] = 0

    # Store profile in Firestore
    db.collection("users").document(uid).set(user_data)

    return uid


def login_user(email, password):
    url = (
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"
        f"?key={FIREBASE_WEB_API_KEY}"
    )

    payload = {
        "email": email,
        "password": password,
        "returnSecureToken": True
    }

    response = requests.post(url, json=payload)
    if response.status_code != 200:
        return None

    return response.json()


def verify_token(id_token):
    try:
        decoded = auth.verify_id_token(id_token)
        return decoded
    except Exception:
        return None


def get_user_profile(uid):
    doc = db.collection("users").document(uid).get()
    if not doc.exists:
        return None
    return doc.to_dict()


def get_all_users():
    try:
        users = db.collection("users").stream()
        return [{**doc.to_dict(), "uid": doc.id} for doc in users]
    except Exception:
        return None


def get_user_by_public_key(public_key):
    try:
        users_ref = db.collection("users")
        query = users_ref.where("public_key", "==", public_key).limit(1)
        results = query.stream()
        for doc in results:
            return {**doc.to_dict(), "uid": doc.id}
        return None
    except Exception as e:
        print(f"Error getting user by public key: {e}")
        return None


def update_user_profile(uid, new_data):
    try:
        db.collection("users").document(uid).update(new_data)
        return True
    except Exception as e:
        print(f"Error updating user profile: {e}")
        return False


def get_validators():
    try:
        users_ref = db.collection("users")
        query = users_ref.where("is_validator", "==", True)
        results = query.stream()
        return [{**doc.to_dict(), "uid": doc.id} for doc in results]
    except Exception as e:
        print(f"Error getting validators: {e}")
        return []
