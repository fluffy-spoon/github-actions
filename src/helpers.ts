import glob from 'glob';
import fs from 'fs';
import http from 'http';

import { join } from "path";
import { getGitHubContext } from './environment';
// import { setFailed } from '@actions/core';

export async function globSearch(pattern: string) {
    let context = await getGitHubContext();
    return new Promise<string[]>((resolve, reject) =>
        glob(join(context.environment.WORKSPACE, pattern), {}, (err, files) => {
            if (err)
                return reject(err);

            return resolve(files);
        }));
}

export async function downloadFile(localFilePath: string, url: string) {
    var file = fs.createWriteStream(localFilePath);
    return new Promise((resolve, reject) => {
        http.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close();
                resolve();
            });
        }).on('error', function (err) {
            fs.unlinkSync(localFilePath);
            reject(err);
        });
    });
}

export function fail(message: string) {
    console.error(message);
    // setFailed(message);
    throw new Error(message);
}