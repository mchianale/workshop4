import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

// 3.1
const registeredNodes: Node[] = [];
export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

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
      const newNode: Node = { nodeId, pubKey };
      registeredNodes.push(newNode);
      return res.json({ success: true });
    } catch (error) {
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
    const payload = {nodes: registeredNodes};
    return res.json(payload);
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
