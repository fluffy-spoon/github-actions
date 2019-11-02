import glob from 'glob';
import path from 'path';
import fs from 'fs';

let workspacePath = process.env.GITHUB_WORKSPACE || './';
console.log('root', workspacePath);

fs.readdirSync('/').forEach(file => {
  console.log('rooty', file);
});

fs.readdirSync('~/').forEach(file => {
  console.log('mooty', file);
});

fs.readdirSync('../').forEach(file => {
  console.log('looty', file);
});

glob("~/**/*", {}, (err, files) => {
    console.log('files?', err, files);

    for(let file of files) {
        console.log(file);
    }
});