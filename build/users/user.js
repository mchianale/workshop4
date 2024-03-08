"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
const crypto_1 = require("../crypto");
async function user(userId) {
    const _user = (0, express_1.default)();
    _user.use(express_1.default.json());
    _user.use(body_parser_1.default.json());
    // 1.1
    _user.get("/status", (req, res) => {
        res.send("live");
    });
    //2.2
    let prevMessageReceived = null;
    let prevMessageSend = null;
    _user.get("/getLastReceivedMessage", (req, res) => {
        return res.json({ result: prevMessageReceived });
    });
    _user.get("/getLastSentMessage", (req, res) => {
        return res.json({ result: prevMessageSend });
    });
    // 4
    _user.post("/message", (req, res) => {
        const { message } = req.body;
        if (!message) {
            prevMessageReceived = '';
            return res.send('send empty message');
        }
        else {
            prevMessageReceived = message;
            return res.send('success to send');
        }
    });
    _user.post("/sendMessage", async (req, res) => {
        const { message, destinationUserId } = req.body;
        prevMessageSend = message;
        try {
            // Fetch all nodes from the registry
            const response = await fetch(`http://localhost:${config_1.REGISTRY_PORT}/getNodeRegistry`);
            if (!response.ok) {
                throw new Error(`Failed to fetch nodes from the registry. Status: ${response.status}`);
            }
            const body = await response.json();
            let registeredNodes = body.nodes; // Define the type of registeredNodes
            registeredNodes = registeredNodes.map((node, i, arr) => {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
                return node;
            });
            // Select intermediary nodes for the circuit
            const path = registeredNodes.slice(0, 3);
            // Prepare the message
            let messageToSend = message;
            if (!messageToSend) {
                return res.status(400).json({ error: 'Request body must contain a message property' });
            }
            // Iterate through the circuit and encrypt the message
            for (let i = path.length - 1; i >= 0; i--) {
                const node = path[i];
                const symKey = await (0, crypto_1.createRandomSymmetricKey)();
                const destination = i === path.length - 1 ?
                    `${config_1.BASE_USER_PORT + destinationUserId}`.padStart(10, '0') :
                    `${config_1.BASE_ONION_ROUTER_PORT + path[i + 1].nodeId}`.padStart(10, '0');
                console.log(destination);
                const messageToEncrypt = `${destination + messageToSend}`;
                const encryptedMessage = await (0, crypto_1.symEncrypt)(symKey, messageToEncrypt);
                const encryptedSymKey = await (0, crypto_1.rsaEncrypt)(await (0, crypto_1.exportSymKey)(symKey), node.pubKey);
                messageToSend = encryptedSymKey + encryptedMessage;
            }
            // Send the message to the first node in the circuit
            const entryNode = path[0];
            const lastPath = path;
            await fetch(`http://localhost:${config_1.BASE_ONION_ROUTER_PORT + entryNode.nodeId}/message`, {
                method: "POST",
                body: JSON.stringify({ message: messageToSend }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            prevMessageSend = message;
            return res.json({ success: true });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'An error occurred while processing the request' });
        }
    });
    const server = _user.listen(config_1.BASE_USER_PORT + userId, () => {
        console.log(`User ${userId} is listening on port ${config_1.BASE_USER_PORT + userId}`);
    });
    return server;
}
exports.user = user;
