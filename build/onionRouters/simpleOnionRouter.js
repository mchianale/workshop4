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
    // 1.1
    onionRouter.get("/status", (req, res) => {
        return res.send("live");
    });
    // 2.1
    let prevReceivedEncryptedMessage = null;
    let prevReceivedDecryptedMessage = null;
    let prevDestination = null;
    const { publicKey, privateKey } = await (0, crypto_1.generateRsaKeyPair)();
    const pubKeyB64 = await (0, crypto_1.exportPubKey)(publicKey);
    const privKeyB64 = await (0, crypto_1.exportPrvKey)(privateKey);
    onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
        return res.json({ result: prevReceivedEncryptedMessage });
    });
    onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
        return res.json({ result: prevReceivedDecryptedMessage });
    });
    onionRouter.get("/getLastMessageDestination", (req, res) => {
        return res.json({ result: prevDestination });
    });
    onionRouter.get("/getPrivateKey", (req, res) => {
        return res.json({ result: privKeyB64 });
    });
    try {
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
    }
    catch (error) {
        console.error(error);
        // Handle the error appropriately
    }
    onionRouter.post("/message", async (req, res) => {
        const layer = req.body.message;
        const encryptedSymKey = layer.slice(0, 344);
        const symKey = privKeyB64 ? await (0, crypto_1.rsaDecrypt)(encryptedSymKey, await (0, crypto_1.importPrvKey)(privKeyB64)) : null;
        const encryptedMessage = layer.slice(344);
        const message = symKey ? await (0, crypto_1.symDecrypt)(symKey, encryptedMessage) : null;
        prevReceivedEncryptedMessage = layer;
        prevReceivedDecryptedMessage = message ? message.slice(10) : null;
        prevDestination = message ? parseInt(message.slice(0, 10), 10) : null;
        await fetch(`http://localhost:${prevDestination}/message`, {
            method: "POST",
            body: JSON.stringify({ message: prevReceivedDecryptedMessage }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        return res.json({ success: true });
    });
    const server = onionRouter.listen(config_1.BASE_ONION_ROUTER_PORT + nodeId, () => {
        console.log(`Onion router ${nodeId} is listening on port ${config_1.BASE_ONION_ROUTER_PORT + nodeId}`);
    });
    return server;
}
exports.simpleOnionRouter = simpleOnionRouter;
