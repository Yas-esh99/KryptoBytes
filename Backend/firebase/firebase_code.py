import firebase_admin
from firebase_admin import credentials, auth, firestore
import bcrypt
import requests

# 1. Initialize Firebase Admin SDK
# Use the full path to the JSON file on your computer
import os

# This automatically finds the folder where firebase.py is located
base_path = os.path.dirname(__file__)
json_path = os.path.join(base_path, "krytpbytes-firebase-adminsdk-fbsvc-b97802092a.json")

cred = credentials.Certificate(json_path)


firebase_admin.initialize_app(cred)
db = firestore.client()

# PLEASE REPLACE WITH YOUR FIREBASE WEB API KEY
FIREBASE_WEB_API_KEY = "AIzaSyAZmYb545gnsmRE25spJDSt1xc4WthWTfg"

def create_user_with_profile(user_data):
    try:
        # 2. Create User in Firebase Authentication
        # Passwords are encrypted automatically by Firebase
        user_record = auth.create_user(
            email=user_data['email'],
            password=user_data['password'],
            display_name=user_data['name']
        )
        
        # 3. Prepare data for Firestore (excluding raw password for security)
        # It is best practice to store the Auth 'uid' as the Firestore Document ID
        profile_details = {
            "uid": user_record.uid,
            "name": user_data['name'],
            "email": user_data['email'],
            "role": user_data['role'], # 'student' or 'professor'
            "college_id": user_data['college_id'],
            "department": user_data['department'],
            "public_key": user_data['public_key'],
            "private_key": user_data['private_key'], # WARNING: Encrypt this if possible
            "balance": user_data['balance'],
            "created_at": firestore.SERVER_TIMESTAMP
        }

        # 4. Save to Firestore collection "users"
        db.collection("users").document(user_record.uid).set(profile_details)
        
        print(f"Successfully created user: {user_record.uid}")
        return user_record.uid

    except Exception as e:
        print(f"Error creating user: {e}")
        return None

def login_user(email, password):
    try:
        rest_api_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_WEB_API_KEY}"
        
        payload = {
            "email": email,
            "password": password,
            "returnSecureToken": True
        }
        
        response = requests.post(rest_api_url, json=payload)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        return response.json()
    except requests.exceptions.HTTPError as err:
        print(f"Error logging in user: {err.response.text}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None


def verify_token(id_token):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"Error verifying token: {e}")
        return None

def get_user_profile(uid):
    try:
        user_doc = db.collection("users").document(uid).get()
        if user_doc.exists:
            return user_doc.to_dict()
        else:
            return None
    except Exception as e:
        print(f"Error getting user profile: {e}")
        return None

def get_all_users():
    try:
        users_ref = db.collection('users')
        users_docs = users_ref.stream()
        users_list = [user.to_dict() for user in users_docs]
        return users_list
    except Exception as e:
        print(f"Error getting all users: {e}")
        return None
