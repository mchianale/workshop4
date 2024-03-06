import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT } from "../config";

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  // 1.1
  onionRouter.get("/status", (req, res) => {
    return res.send("live");
  });

  // 2.1
  let prevReceivedEncryptedMessage: any = null;
  let prevReceivedDecryptedMessage: any = null;
  let prevDestination: any  = null;

  onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
    return res.json({ result: prevReceivedEncryptedMessage });
  });

  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    return res.json({ result: prevReceivedDecryptedMessage });
  });

  onionRouter.get("/getLastMessageDestination", (req, res) => {
    return res.json({ result: prevDestination });
  });

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
      `Onion router ${nodeId} is listening on port ${
        BASE_ONION_ROUTER_PORT + nodeId
      }`
    );
  });

  return server;
}
