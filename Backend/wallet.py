import base64
import ecdsa
import json
import hashlib


def verify_ECDSA_msg(public_key, signature, message):
    """Verify the signature of the message
    public_key: must be hex
    signature: must be hex
    message: dict
    """
    try:
        # Create a canonical JSON string to ensure consistency between client and server.
        bmessage = json.dumps(message, separators=(',', ':'), sort_keys=True).encode()
        message_hash = hashlib.sha256(bmessage).digest()
        
        # Public key from client is in hex format
        vk_string = bytes.fromhex(public_key)
        
        # Note: public keys in 'elliptic' are uncompressed by default.
        # The 'ecdsa' library in Python expects uncompressed keys.
        vk = ecdsa.VerifyingKey.from_string(vk_string, curve=ecdsa.SECP256k1)
        
        signature_decoded = bytes.fromhex(signature)
        
        # Use verify_digest as the client is signing a hash
        return vk.verify_digest(signature_decoded, message_hash)
    except Exception as e:
        print(f"Error verifying signature: {e}")
        return False