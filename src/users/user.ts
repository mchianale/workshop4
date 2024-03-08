import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT, REGISTRY_PORT, BASE_ONION_ROUTER_PORT } from "../config";
import {Node} from "../registry/registry";
import {rsaEncrypt, symEncrypt, createRandomSymmetricKey, exportSymKey} from "../crypto";

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

  _user.post("/sendMessage", async (req, res) => {
    const { message, destinationUserId }: SendMessageBody = req.body;
    prevMessageSend = message;

    try {
      // Fetch all nodes from the registry
      const response = await fetch(`http://localhost:${REGISTRY_PORT}/getNodeRegistry`);
      if (!response.ok) {
        throw new Error(`Failed to fetch nodes from the registry. Status: ${response.status}`);
      }

      const body = await response.json() as { nodes: Node[] };
      let registeredNodes: Node[] = body.nodes; // Define the type of registeredNodes
      registeredNodes = registeredNodes.map((node: Node, i: number, arr: Node[]) => {
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
        const symKey = await createRandomSymmetricKey();
        const destination = i === path.length - 1 ?
            `${BASE_USER_PORT + destinationUserId}`.padStart(10, '0') :
            `${BASE_ONION_ROUTER_PORT + path[i + 1].nodeId}`.padStart(10, '0');
        console.log(destination);
        const messageToEncrypt = `${destination + messageToSend}`;
        const encryptedMessage = await symEncrypt(symKey, messageToEncrypt);
        const encryptedSymKey = await rsaEncrypt(await exportSymKey(symKey), node.pubKey);
        messageToSend = encryptedSymKey + encryptedMessage;
      }

      // Send the message to the first node in the circuit
      const entryNode = path[0];
      const lastPath = path;
      await fetch(`http://localhost:${BASE_ONION_ROUTER_PORT + entryNode.nodeId}/message`, {
        method: "POST",
        body: JSON.stringify({ message: messageToSend }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      prevMessageSend = message;
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while processing the request' });
    }
  });

  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}
