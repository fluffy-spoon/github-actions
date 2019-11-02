import glob from 'glob';
import path from 'path';
import fs from 'fs';

let workspacePath = process.env.GITHUB_WORKSPACE;
if(!workspacePath)
    throw new Error('Could not find workspace path.');

glob(path.join(workspacePath, "**/*.sln"), {}, (err, files) => {
    console.log('files?', err, files);

    for(let file of files) {
        console.log(file);
    }
});