import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT, REGISTRY_PORT } from "../config";
import { generateRsaKeyPair, exportPubKey, exportPrvKey, importPrvKey, rsaDecrypt, symDecrypt } from "../crypto";

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
  let prevDestination: any = null;

  const { publicKey, privateKey } = await generateRsaKeyPair();
  const pubKeyB64 = await exportPubKey(publicKey);
  const privKeyB64 = await exportPrvKey(privateKey);

  onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
    return res.json({ result: prevReceivedEncryptedMessage });
  });

  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    return res.json({ result: prevReceivedDecryptedMessage });
  });

  onionRouter.get("/getLastMessageDestination", (req, res) => {
    return res.json({ result: prevDestination });
  });

  onionRouter.get("/getPrivateKey", (req, res) => {
    return res.json({ result: privKeyB64 });
  });

  try {
    const response = await fetch(`http://localhost:${REGISTRY_PORT}/registerNode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nodeId: nodeId,
        pubKey: pubKeyB64,
      }),
    });


  } catch (error) {
    console.error(error);
    // Handle the error appropriately
  }

  onionRouter.post("/message", async (req, res) => {
    const layer = req.body.message;
    const encryptedSymKey = layer.slice(0, 344);
    const symKey = privKeyB64 ? await rsaDecrypt(encryptedSymKey, await importPrvKey(privKeyB64)) : null;
    const encryptedMessage = layer.slice(344) as string;
    const message = symKey ? await symDecrypt(symKey, encryptedMessage) : null;
    prevReceivedEncryptedMessage = layer;
    prevReceivedDecryptedMessage = message ? message.slice(10) : null;
    prevDestination = message ? parseInt(message.slice(0, 10), 10) : null;
    await fetch(`http://localhost:${prevDestination}/message`, {
      method: "POST",
      body: JSON.stringify({ message: prevReceivedDecryptedMessage }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.json({ success: true });
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
