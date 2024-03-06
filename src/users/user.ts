import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT } from "../config";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  // 1.1
  _user.get("/status", (req, res) => {
    res.send("live")
  });

  //2.2
  let lastReceivedMessage: string | null = null;
  let lastSentMessage: string | null = null;

  _user.get("/getLastReceivedMessage", (req, res) => {
    res.json({ result: lastReceivedMessage });
  });

  _user.get("/getLastSentMessage", (req, res) => {
    res.json({ result: lastSentMessage });
  });

  // 4
  _user.post("/message", (req, res) => {
    const { message }: { message: string } = req.body;
    lastReceivedMessage = message;
    res.send('success to send');
  });

  _user.post("/sendMessage", (req, res) => {
    const { message, destinationUserId }: SendMessageBody = req.body;
    lastSentMessage = message;
    res.json({ success: true });
  });

  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}
