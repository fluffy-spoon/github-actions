"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('helpers.ts');
const glob_1 = __importDefault(require("glob"));
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const path_1 = require("path");
const environment_1 = require("./environment");
const core_1 = require("@actions/core");
async function globSearch(pattern) {
    console.log('begin-glob', pattern);
    let context = await environment_1.getGitHubContext();
    return new Promise((resolve, reject) => glob_1.default(path_1.join(context.environment.WORKSPACE, pattern), {}, (err, files) => {
        if (err) {
            console.log('err-glob', pattern, err);
            return reject(err);
        }
        console.log('end-glob', pattern, files);
        return resolve(files);
    }));
}
exports.globSearch = globSearch;
async function downloadFile(localFilePath, url) {
    var file = fs_1.default.createWriteStream(localFilePath);
    return new Promise((resolve, reject) => {
        http_1.default.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close();
                resolve();
            });
        }).on('error', function (err) {
            fs_1.default.unlinkSync(localFilePath);
            reject(err);
        });
    });
}
exports.downloadFile = downloadFile;
function fail(obj) {
    console.error(obj);
    core_1.setFailed(obj.message || obj);
}
exports.fail = fail;
