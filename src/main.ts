console.log('bazbaz');

import glob from 'glob';

console.log('foobar');

glob("**/*", {}, (err, files) => {
    console.log('files?', err, files);

    for(let file of files) {
        console.log(file);
    }
});

console.log('donebuz');