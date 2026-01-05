import os
import json
import firebase_admin
from firebase_admin import credentials, auth, firestore
import requests

# --- SECURE INITIALIZATION ---
base_path = os.path.dirname(__file__)
# 1. Check if we are in production (on Render) via an Environment Variable
firebase_creds_json = os.environ.get('FIREBASE_CONFIG')

if not firebase_admin._apps:
    if firebase_creds_json:
        # PRODUCTION: Use the environment variable
        cred_dict = json.loads(firebase_creds_json)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
    else:
        # LOCAL: Use your local JSON file
        json_path = os.path.join(base_path, "krytpbytes-firebase-adminsdk-fbsvc-4b59bc592f.json")
        cred = credentials.Certificate(json_path)
        firebase_admin.initialize_app(cred)

db = firestore.client()

# Use Environment Variable for the API Key as well for better security
FIREBASE_WEB_API_KEY = os.environ.get('FIREBASE_WEB_API_KEY', "AIzaSyAZmYb545gnsmRE25spJDSt1xc4WthWTfg")
# ------------------------------

# ... rest of your functions (create_user_with_profile, login_user, etc.) remain the samegit