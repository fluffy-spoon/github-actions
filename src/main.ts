console.log('bazbaz', process.cwd(), __dirname, __filename, process.env.GITHUB_WORKSPACE);

import glob from 'glob';

console.log('foobar');

glob("**/*", {}, (err, files) => {
    console.log('files?', err, files);

    for(let file of files) {
        console.log(file);
    }
});

console.log('donebuz');