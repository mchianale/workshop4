"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const crypto_1 = require("../crypto");
const config_1 = require("../config");
async function user(userId) {
    const _user = (0, express_1.default)();
    _user.use(express_1.default.json());
    _user.use(body_parser_1.default.json());
    let prevMessageSent = null;
    let prevMessageReceived = null;
    let pathTemp = [];
    // 1.2
    _user.get("/status", (req, res) => {
        res.send("live");
    });
    // 2.2
    _user.get("/getLastReceivedMessage", (req, res) => {
        res.json({ result: prevMessageReceived });
    });
    _user.get("/getLastSentMessage", (req, res) => {
        res.json({ result: prevMessageSent });
    });
    _user.get("/getLastCircuit", (req, res) => {
        res.json({ result: pathTemp.map((node) => node.nodeId) });
    });
    // 6.1
    _user.post("/sendMessage", async (req, res) => {
        const { message, destinationUserId } = req.body;
        const nodes = await fetch(`http://localhost:${config_1.REGISTRY_PORT}/getNodeRegistry`)
            .then((res) => res.json())
            .then((body) => body.nodes);
        let path = [];
        const shuffledNodes = nodes.sort(() => Math.random() - 0.5);
        path = shuffledNodes.slice(0, 3);
        let msg = message;
        if (!msg || msg.trim() === '') {
            res.status(400).json({ error: "The message can't be empty" });
            return;
        }
        let i = path.length - 1;
        while (i >= 0) {
            const node = path[i];
            const symKey = await (0, crypto_1.createRandomSymmetricKey)();
            const destination = i === path.length - 1 ?
                `${config_1.BASE_USER_PORT + destinationUserId}`.padStart(10, '0') :
                `${config_1.BASE_ONION_ROUTER_PORT + path[i + 1].nodeId}`.padStart(10, '0');
            const encryptedMSG = await (0, crypto_1.symEncrypt)(symKey, `${destination}${msg}`);
            const encryptedKey = await (0, crypto_1.rsaEncrypt)(await (0, crypto_1.exportSymKey)(symKey), node.pubKey);
            msg = encryptedKey + encryptedMSG;
            i--;
        }
        const currentNode = path[0];
        pathTemp = path;
        await fetch(`http://localhost:${config_1.BASE_ONION_ROUTER_PORT + currentNode.nodeId}/message`, {
            method: "POST",
            body: JSON.stringify({ message: msg }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        prevMessageSent = message;
        res.send("success");
    });
    // 6.2
    _user.post("/message", (req, res) => {
        prevMessageReceived = req.body.message;
        if (prevMessageReceived) {
            res.status(200).send("success");
        }
        else {
            res.status(400).json({ error: 'message must not be empty' });
        }
    });
    const server = _user.listen(config_1.BASE_USER_PORT + userId, () => {
        console.log(`User ${userId} is listening on port ${config_1.BASE_USER_PORT + userId}`);
    });
    return server;
}
exports.user = user;
