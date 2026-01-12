import { ec } from 'elliptic';
import sha256 from 'crypto-js/sha256'; // Import sha256

const ecdsa = new ec('secp256k1');

export const generateKeys = () => {
    const keyPair = ecdsa.genKeyPair();
    const publicKey = keyPair.getPublic('hex');
    const privateKey = keyPair.getPrivate('hex');
    return { publicKey, privateKey };
};

export const signMessage = (privateKey: string, message: any) => {
    const keyPair = ecdsa.keyFromPrivate(privateKey, 'hex');
    
    // Create a canonical JSON string by sorting keys.
    const orderedMessage = {};
    Object.keys(message).sort().forEach(key => {
      orderedMessage[key] = message[key];
    });
    const messageString = JSON.stringify(orderedMessage);

    // Hash the canonical message string before signing
    const messageHash = sha256(messageString).toString();
    const signature = keyPair.sign(messageHash);
    
    // Concatenate r and s to get the raw 64-byte signature, and return as a hex string
    const r = signature.r.toString('hex').padStart(64, '0');
    const s = signature.s.toString('hex').padStart(64, '0');

    return r + s;
};
