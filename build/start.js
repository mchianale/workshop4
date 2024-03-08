"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
async function getNodeRegistry() {
    const nodes = await fetch(`http://localhost:8080/getNodeRegistry`)
        .then((res) => res.json())
        .then((json) => json.nodes);
    return nodes;
}
async function main() {
    await (0, _1.launchNetwork)(10, 2);
    const nodes = await getNodeRegistry();
    console.log(nodes.length);
    for (let index = 0; index < 10; index++) {
        const node = nodes.find((_n) => _n.nodeId === index);
        console.log(node);
    }
}
main();
