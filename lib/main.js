"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('main.ts');
const dotnet_1 = __importDefault(require("./dotnet"));
const helpers_1 = require("./helpers");
async function run() {
    await dotnet_1.default();
}
run().catch(helpers_1.fail);
exports.default = run;
