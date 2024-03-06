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
    _user.post("/sendMessage", (req, res) => {
        const { message, destinationUserId } = req.body;
        prevMessageSend = message;
        return res.json({ success: true });
    });
    const server = _user.listen(config_1.BASE_USER_PORT + userId, () => {
        console.log(`User ${userId} is listening on port ${config_1.BASE_USER_PORT + userId}`);
    });
    return server;
}
exports.user = user;
