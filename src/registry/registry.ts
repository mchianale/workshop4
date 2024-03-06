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
    res.send("live");
  });

  // 3.1
  _registry.post("/registerNode", (req, res) => {
    const { nodeId, pubKey } = req.body as RegisterNodeBody;
    const newNode: Node = { nodeId, pubKey };
    registeredNodes.push(newNode);
    res.json({ success: true });
  });

  // 3.2
  _registry.get("/getPrivateKey/:nodeId", (req, res) => {
    const nodeId = parseInt(req.params.nodeId, 10);
    const node = registeredNodes.find((n) => n.nodeId === nodeId);

    if (node) {
      res.json({ result: node.pubKey });
    } else {
      res.status(404).json({ error: "Node wasn't find" });
    }
  });

  // 3.3
  _registry.get("/getNodeRegistry", (req, res) => {
    const nodeRegistry: GetNodeRegistryBody = { nodes: registeredNodes };
    res.json(nodeRegistry);
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
