"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
async function main() {
    try {
        await (0, index_1.launchNetwork)(2, 10);
    }
    catch (error) {
        console.error("Error launching network:", error);
    }
}
main();
