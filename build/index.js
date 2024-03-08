"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchNetwork = void 0;
const launchOnionRouters_1 = require("./onionRouters/launchOnionRouters");
const registry_1 = require("./registry/registry");
const launchUsers_1 = require("./users/launchUsers");
const config_1 = require("./config");
async function launchNetwork(nbNodes, nbUsers) {
    // launch node registry
    const registry = await (0, registry_1.launchRegistry)();
    try {
        for (let nodeId = 0; nodeId < nbNodes; nodeId++) {
            // Register the node with nodeId = index and a placeholder pubKey
            const pubKey = "test";
            const response = await fetch(`http://localhost:${config_1.REGISTRY_PORT}/registerNode`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ nodeId, pubKey })
            });
            if (!response.ok) {
                throw new Error("Failed to register node");
            }
        }
    }
    catch (error) {
        console.error("Error registering nodes:", error);
    }
    // launch all nodes
    const onionServers = await (0, launchOnionRouters_1.launchOnionRouters)(nbNodes);
    // launch all users
    const userServers = await (0, launchUsers_1.launchUsers)(nbUsers);
    return [registry, ...onionServers, ...userServers];
}
exports.launchNetwork = launchNetwork;
