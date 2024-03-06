"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.symDecrypt = exports.symEncrypt = exports.importSymKey = exports.exportSymKey = exports.createRandomSymmetricKey = exports.rsaDecrypt = exports.rsaEncrypt = exports.importPrvKey = exports.importPubKey = exports.exportPrvKey = exports.exportPubKey = exports.generateRsaKeyPair = void 0;
const crypto_1 = require("crypto");
// #############
// ### Utils ###
// #############
// Function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer) {
    return Buffer.from(buffer).toString("base64");
}
// Function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64) {
    var buff = Buffer.from(base64, "base64");
    return buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);
}
// 4
async function generateRsaKeyPair() {
    // TODO implement this function using the crypto package to generate a public and private RSA key pair.
    //      the public key should be used for encryption and the private key for decryption. Make sure the
    //      keys are extractable.
    const { publicKey, privateKey } = await crypto_1.webcrypto.subtle.generateKey({
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: { name: 'SHA-256' },
    }, true, ['encrypt', 'decrypt']);
    return { publicKey, privateKey };
}
exports.generateRsaKeyPair = generateRsaKeyPair;
// Export a crypto public key to a base64 string format
async function exportPubKey(key) {
    // TODO implement this function to return a base64 string version of a public key
    const exportedKey = await crypto_1.webcrypto.subtle.exportKey('spki', key);
    return arrayBufferToBase64(exportedKey);
}
exports.exportPubKey = exportPubKey;
// Export a crypto private key to a base64 string format
async function exportPrvKey(key) {
    // TODO implement this function to return a base64 string version of a private key
    if (!key)
        return null;
    const exportedKey = await crypto_1.webcrypto.subtle.exportKey('pkcs8', key);
    return arrayBufferToBase64(exportedKey);
}
exports.exportPrvKey = exportPrvKey;
// Import a base64 string public key to its native format
async function importPubKey(strKey) {
    // TODO implement this function to go back from the result of the exportPubKey function to it's native crypto key object
    const binaryKey = base64ToArrayBuffer(strKey);
    return await crypto_1.webcrypto.subtle.importKey('spki', binaryKey, { name: 'RSA-OAEP', hash: { name: 'SHA-256' } }, true, ['encrypt']);
}
exports.importPubKey = importPubKey;
// Import a base64 string private key to its native format
async function importPrvKey(strKey) {
    // TODO implement this function to go back from the result of the exportPrvKey function to it's native crypto key object
    const binaryKey = base64ToArrayBuffer(strKey);
    return await crypto_1.webcrypto.subtle.importKey('pkcs8', binaryKey, { name: 'RSA-OAEP', hash: { name: 'SHA-256' } }, true, ['decrypt']);
}
exports.importPrvKey = importPrvKey;
// Encrypt a message using an RSA public key
async function rsaEncrypt(b64Data, strPublicKey) {
    // TODO implement this function to encrypt a base64 encoded message with a public key
    // tip: use the provided base64ToArrayBuffer function
    const publicKey = await importPubKey(strPublicKey);
    const data = base64ToArrayBuffer(b64Data);
    const encryptedData = await crypto_1.webcrypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, data);
    return arrayBufferToBase64(encryptedData);
}
exports.rsaEncrypt = rsaEncrypt;
// Decrypts a message using an RSA private key
async function rsaDecrypt(data, privateKey) {
    // TODO implement this function to decrypt a base64 encoded message with a private key
    // tip: use the provided base64ToArrayBuffer function
    const encryptedData = base64ToArrayBuffer(data);
    const decryptedData = await crypto_1.webcrypto.subtle.decrypt({ name: 'RSA-OAEP' }, privateKey, encryptedData);
    return arrayBufferToBase64(decryptedData);
}
exports.rsaDecrypt = rsaDecrypt;
// ######################
// ### Symmetric keys ###
// ######################
// Generates a random symmetric key
async function createRandomSymmetricKey() {
    // TODO implement this function using the crypto package to generate a symmetric key.
    //      the key should be used for both encryption and decryption. Make sure the
    //      keys are extractable.
    return await crypto_1.webcrypto.subtle.generateKey({ name: 'AES-CBC', length: 256 }, true, ['encrypt', 'decrypt']);
}
exports.createRandomSymmetricKey = createRandomSymmetricKey;
// Export a crypto symmetric key to a base64 string format
async function exportSymKey(key) {
    // TODO implement this function to return a base64 string version of a symmetric key
    const exportedKey = await crypto_1.webcrypto.subtle.exportKey('raw', key);
    return arrayBufferToBase64(exportedKey);
}
exports.exportSymKey = exportSymKey;
// Import a base64 string format to its crypto native format
async function importSymKey(strKey) {
    // TODO implement this function to go back from the result of the exportSymKey function to it's native crypto key object
    const binaryKey = base64ToArrayBuffer(strKey);
    return await crypto_1.webcrypto.subtle.importKey('raw', binaryKey, { name: 'AES-CBC' }, true, ['encrypt', 'decrypt']);
}
exports.importSymKey = importSymKey;
// Encrypt a message using a symmetric key
async function symEncrypt(key, data) {
    // TODO implement this function to encrypt a base64 encoded message with a public key
    // tip: encode the data to a uin8array with TextEncoder
    const encodedData = new TextEncoder().encode(data);
    const iv = crypto_1.webcrypto.getRandomValues(new Uint8Array(16));
    const encryptedData = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, encodedData);
    const result = new Uint8Array(iv.length + encryptedData.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encryptedData), iv.length);
    return arrayBufferToBase64(result.buffer);
}
exports.symEncrypt = symEncrypt;
// Decrypt a message using a symmetric key
async function symDecrypt(strKey, encryptedData) {
    // TODO implement this function to decrypt a base64 encoded message with a private key
    // tip: use the provided base64ToArrayBuffer function and use TextDecode to go back to a string format
    const key = await importSymKey(strKey);
    const encryptedDataArray = base64ToArrayBuffer(encryptedData);
    const decryptedDataArray = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: new Uint8Array(16) }, key, encryptedDataArray);
    const decryptedData = new TextDecoder().decode(decryptedDataArray.slice(16));
    return decryptedData;
}
exports.symDecrypt = symDecrypt;
