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
  let prevMessageReceived: string | null = null;
  let prevMessageSend: string | null = null;

  _user.get("/getLastReceivedMessage", (req, res) => {
    return res.json({ result: prevMessageReceived });
  });

  _user.get("/getLastSentMessage", (req, res) => {
    return res.json({ result: prevMessageSend });
  });

  // 4
  _user.post("/message", (req, res) => {
    const { message }: { message: any} = req.body;
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
    const { message, destinationUserId }: SendMessageBody = req.body;
    prevMessageSend = message;
    return res.json({ success: true });
  });

  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}
