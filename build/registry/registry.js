"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchRegistry = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
// 3.1
const registeredNodes = [];
async function launchRegistry() {
    const _registry = (0, express_1.default)();
    _registry.use(express_1.default.json());
    _registry.use(body_parser_1.default.json());
    // 1.3
    _registry.get("/status", (req, res) => {
        return res.send("live");
    });
    // 3.1
    _registry.post("/registerNode", async (req, res) => {
        try {
            const { nodeId, pubKey } = req.body;
            // Check if nodeId already exists
            const nodeIdExists = registeredNodes.some(node => node.nodeId === nodeId);
            if (nodeIdExists) {
                return res.json({ success: false, error: 'Node ID already exists' });
            }
            // Check if pubKey is in the right format
            // Assuming pubKey is a base64 encoded string
            const isValidPubKey = /^[a-zA-Z0-9+/]+={0,2}$/.test(pubKey);
            if (!isValidPubKey) {
                return res.json({ success: false, error: 'Invalid public key format' });
            }
            // Check if pubKey already exists
            const pubKeyExists = registeredNodes.some(node => node.pubKey === pubKey);
            if (pubKeyExists) {
                return res.json({ success: false, error: 'Public key already exists' });
            }
            // If all checks pass, register the node
            const newNode = { nodeId, pubKey };
            registeredNodes.push(newNode);
            return res.json({ success: true });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'An error occurred while processing the request' });
        }
    });
    // 3.2
    _registry.get("/getPrivateKey/:nodeId", (req, res) => {
        const nodeId = parseInt(req.params.nodeId, 10);
        const node = registeredNodes.find((n) => n.nodeId === nodeId);
        if (!node) {
            return res.status(404).json({ error: "Node wasn't find" });
        }
        return res.json({ result: node.pubKey });
    });
    // 3.3
    _registry.get("/getNodeRegistry", (req, res) => {
        const payload = { nodes: registeredNodes };
        return res.json(payload);
    });
    const server = _registry.listen(config_1.REGISTRY_PORT, () => {
        console.log(`registry is listening on port ${config_1.REGISTRY_PORT}`);
    });
    return server;
}
exports.launchRegistry = launchRegistry;
