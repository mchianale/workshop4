"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
async function user(userId) {
    const _user = (0, express_1.default)();
    _user.use(express_1.default.json());
    _user.use(body_parser_1.default.json());
    // 1.1
    _user.get("/status", (req, res) => {
        res.send("live");
    });
    //2.2
    let lastReceivedMessage = null;
    let lastSentMessage = null;
    _user.get("/getLastReceivedMessage", (req, res) => {
        res.json({ result: lastReceivedMessage });
    });
    _user.get("/getLastSentMessage", (req, res) => {
        res.json({ result: lastSentMessage });
    });
    // 4
    _user.post("/message", (req, res) => {
        const { message } = req.body;
        if (!message) {
            lastReceivedMessage = null;
            res.send('send empty message');
        }
        else {
            lastReceivedMessage = message;
            res.send('success to send');
        }
    });
    _user.post("/sendMessage", (req, res) => {
        const { message, destinationUserId } = req.body;
        lastSentMessage = message;
        res.json({ success: true });
    });
    const server = _user.listen(config_1.BASE_USER_PORT + userId, () => {
        console.log(`User ${userId} is listening on port ${config_1.BASE_USER_PORT + userId}`);
    });
    return server;
}
exports.user = user;
