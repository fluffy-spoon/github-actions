import glob from 'glob';
import path from 'path';

import exec from '@actions/exec';

let workspacePath = process.env.GITHUB_WORKSPACE;
if(!workspacePath)
    throw new Error('Could not find workspace path.');

async function compileSolutionFile(filePath: string) {

}

async function globSearch(pattern: string) {
    return new Promise<string[]>((resolve, reject) => 
        glob(pattern, {}, (err, files) => {
            if(err)
                return reject(err);

            return resolve(files);
        }));
}

// @ts-ignore
var solutionFiles = await globSearch(path.join(workspacePath, "**/*.sln"));
for(let solutionFile of solutionFiles) {
    // @ts-ignore
    await exec(`dotnet "${solutionFile}" build`);
}