"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.symDecrypt = exports.symEncrypt = exports.importSymKey = exports.exportSymKey = exports.createRandomSymmetricKey = exports.rsaDecrypt = exports.rsaEncrypt = exports.importPrvKey = exports.importPubKey = exports.exportPrvKey = exports.exportPubKey = exports.generateRsaKeyPair = void 0;
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
async function generateRsaKeyPair() {
    // TODO implement this function using the crypto package to generate a public and private RSA key pair.
    //      the public key should be used for encryption and the private key for decryption. Make sure the
    //      keys are extractable.
    // remove this
    return { publicKey: {}, privateKey: {} };
}
exports.generateRsaKeyPair = generateRsaKeyPair;
// Export a crypto public key to a base64 string format
async function exportPubKey(key) {
    // TODO implement this function to return a base64 string version of a public key
    // remove this
    return "";
}
exports.exportPubKey = exportPubKey;
// Export a crypto private key to a base64 string format
async function exportPrvKey(key) {
    // TODO implement this function to return a base64 string version of a private key
    // remove this
    return "";
}
exports.exportPrvKey = exportPrvKey;
// Import a base64 string public key to its native format
async function importPubKey(strKey) {
    // TODO implement this function to go back from the result of the exportPubKey function to it's native crypto key object
    // remove this
    return {};
}
exports.importPubKey = importPubKey;
// Import a base64 string private key to its native format
async function importPrvKey(strKey) {
    // TODO implement this function to go back from the result of the exportPrvKey function to it's native crypto key object
    // remove this
    return {};
}
exports.importPrvKey = importPrvKey;
// Encrypt a message using an RSA public key
async function rsaEncrypt(b64Data, strPublicKey) {
    // TODO implement this function to encrypt a base64 encoded message with a public key
    // tip: use the provided base64ToArrayBuffer function
    // remove this
    return "";
}
exports.rsaEncrypt = rsaEncrypt;
// Decrypts a message using an RSA private key
async function rsaDecrypt(data, privateKey) {
    // TODO implement this function to decrypt a base64 encoded message with a private key
    // tip: use the provided base64ToArrayBuffer function
    // remove this
    return "";
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
    // remove this
    return {};
}
exports.createRandomSymmetricKey = createRandomSymmetricKey;
// Export a crypto symmetric key to a base64 string format
async function exportSymKey(key) {
    // TODO implement this function to return a base64 string version of a symmetric key
    // remove this
    return "";
}
exports.exportSymKey = exportSymKey;
// Import a base64 string format to its crypto native format
async function importSymKey(strKey) {
    // TODO implement this function to go back from the result of the exportSymKey function to it's native crypto key object
    // remove this
    return {};
}
exports.importSymKey = importSymKey;
// Encrypt a message using a symmetric key
async function symEncrypt(key, data) {
    // TODO implement this function to encrypt a base64 encoded message with a public key
    // tip: encode the data to a uin8array with TextEncoder
    return "";
}
exports.symEncrypt = symEncrypt;
// Decrypt a message using a symmetric key
async function symDecrypt(strKey, encryptedData) {
    // TODO implement this function to decrypt a base64 encoded message with a private key
    // tip: use the provided base64ToArrayBuffer function and use TextDecode to go back to a string format
    return "";
}
exports.symDecrypt = symDecrypt;
