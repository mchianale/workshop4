"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchRegistry = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
const nodesRegistry = [];
async function launchRegistry() {
    const _registry = (0, express_1.default)();
    _registry.use(express_1.default.json());
    _registry.use(body_parser_1.default.json());
    // 1.3
    _registry.get("/status", (req, res) => {
        res.send("live");
    });
    const registeredNodes = { nodes: [] };
    // 3.1
    _registry.post("/registerNode", (req, res) => {
        try {
            const { nodeId, pubKey } = req.body;
            // Check if nodeId already exists
            const nodeIdExists = registeredNodes.nodes.some(node => node.nodeId === nodeId);
            if (nodeIdExists) {
                return res.json({ success: false, error: 'Node ID already exists' });
            }
            // Check if pubKey is in the right format
            // Assuming pubKey is a base64 encoded string
            const isValidPubKey = /^[a-zA-Z0-9+/]+={0,2}$/.test(pubKey);
            if (!isValidPubKey) {
                return res.json({ success: false, error: 'Invalid public key format' });
            }
            const pubKeyExists = registeredNodes.nodes.some(node => node.pubKey === pubKey);
            if (pubKeyExists) {
                return res.json({ success: false, error: 'Public key already exists' });
            }
            // If all checks pass, register the node
            const newNode = { nodeId, pubKey };
            registeredNodes.nodes.push(newNode);
            return res.json({ success: true });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'An error occurred while processing the request' });
        }
    });
    // 3.4
    _registry.get("/getNodeRegistry", (req, res) => {
        res.json(registeredNodes);
    });
    const server = _registry.listen(config_1.REGISTRY_PORT, () => {
        console.log(`registry is listening on port ${config_1.REGISTRY_PORT}`);
    });
    return server;
}
exports.launchRegistry = launchRegistry;
