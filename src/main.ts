import glob from 'glob';
import path from 'path';

let workspacePath = process.env.GITHUB_WORKSPACE || './';
console.log('root', workspacePath);

glob(path.join(workspacePath, "**/*"), {}, (err, files) => {
    console.log('files?', err, files);

    for(let file of files) {
        console.log(file);
    }
});