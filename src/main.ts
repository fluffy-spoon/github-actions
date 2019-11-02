import glob from 'glob';
import path from 'path';

import { exec } from '@actions/exec';

var workspacePath = process.env.GITHUB_WORKSPACE as string;
if(typeof workspacePath === "undefined")
    throw new Error('Could not find workspace path.');

async function compileSolutionFile(solutionFile: string) {
    console.log('building', solutionFile);
    await exec("dotnet", ["build", solutionFile]);
}

async function globSearch(pattern: string) {
    return new Promise<string[]>((resolve, reject) => 
        glob(path.join(workspacePath, pattern), {}, (err, files) => {
            if(err)
                return reject(err);

            return resolve(files);
        }));
}

async function run() {
    var solutionFiles = await globSearch("**/*.sln");
    for(let solutionFile of solutionFiles) {
        await compileSolutionFile(solutionFile);
    }
}

run();
export default run; 