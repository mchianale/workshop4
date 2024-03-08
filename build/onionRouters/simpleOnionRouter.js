"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleOnionRouter = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
const crypto_1 = require("../crypto");
async function simpleOnionRouter(nodeId) {
    const onionRouter = (0, express_1.default)();
    onionRouter.use(express_1.default.json());
    onionRouter.use(body_parser_1.default.json());
    let prevMessageEncryptReceived = null;
    let prevMessageDecryptReceived = null;
    let prevDestination = null;
    // 3.2
    const { publicKey, privateKey } = await (0, crypto_1.generateRsaKeyPair)();
    const pubKeyB64 = await (0, crypto_1.exportPubKey)(publicKey);
    const privKeyB64 = await (0, crypto_1.exportPrvKey)(privateKey);
    // 1.1
    onionRouter.get("/status", (req, res) => {
        res.send("live");
    });
    // 2.1
    onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
        res.json({ result: prevMessageEncryptReceived });
    });
    onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
        res.json({ result: prevMessageDecryptReceived });
    });
    onionRouter.get("/getLastMessageDestination", (req, res) => {
        res.json({ result: prevDestination });
    });
    // 3.2
    onionRouter.get("/getPrivateKey", (req, res) => {
        res.json({ result: privKeyB64 });
    });
    const response = await fetch(`http://localhost:${config_1.REGISTRY_PORT}/registerNode`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            nodeId: nodeId,
            pubKey: pubKeyB64,
        }),
    });
    if (!response.ok) {
        throw new Error("Node failed to register");
    }
    // 6.2
    onionRouter.post("/message", async (req, res) => {
        const layer = req.body.message;
        if (!layer) {
            res.status(400).json({ error: 'error with current layer' });
        }
        const encryptedKey = layer.slice(0, 344);
        const Key = privKeyB64 ? await (0, crypto_1.rsaDecrypt)(encryptedKey, await (0, crypto_1.importPrvKey)(privKeyB64)) : null;
        const msgEncrypted = layer.slice(344);
        const msg = Key ? await (0, crypto_1.symDecrypt)(Key, msgEncrypted) : null;
        prevMessageDecryptReceived = msg ? msg.slice(10) : null;
        prevDestination = msg ? parseInt(msg.slice(0, 10), 10) : null;
        prevMessageEncryptReceived = layer;
        await fetch(`http://localhost:${prevDestination}/message`, {
            method: "POST",
            body: JSON.stringify({ message: prevMessageDecryptReceived }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        res.send("success");
    });
    const server = onionRouter.listen(config_1.BASE_ONION_ROUTER_PORT + nodeId, () => {
        console.log(`Onion router ${nodeId} is listening on port ${config_1.BASE_ONION_ROUTER_PORT + nodeId}`);
    });
    return server;
}
exports.simpleOnionRouter = simpleOnionRouter;
