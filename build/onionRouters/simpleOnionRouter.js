"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleOnionRouter = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
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
    onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
        return res.json({ result: prevReceivedEncryptedMessage });
    });
    onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
        return res.json({ result: prevReceivedDecryptedMessage });
    });
    onionRouter.get("/getLastMessageDestination", (req, res) => {
        return res.json({ result: prevDestination });
    });
    const server = onionRouter.listen(config_1.BASE_ONION_ROUTER_PORT + nodeId, () => {
        console.log(`Onion router ${nodeId} is listening on port ${config_1.BASE_ONION_ROUTER_PORT + nodeId}`);
    });
    return server;
}
exports.simpleOnionRouter = simpleOnionRouter;
