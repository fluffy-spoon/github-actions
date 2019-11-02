import glob from 'glob';
import path from 'path';
import fs from 'fs';

let workspacePath = process.env.GITHUB_WORKSPACE || './';
console.log('root', workspacePath);

fs.readdirSync('/').forEach(file => {
  console.log('rooty', file);
});

fs.readdirSync(workspacePath).forEach(file => {
  console.log('looty', file);
});

fs.readdirSync('/home').forEach(file => {
  console.log('mooty', file);
});

glob("~/**/*", {}, (err, files) => {
    console.log('files?', err, files);

    for(let file of files) {
        console.log(file);
    }
});