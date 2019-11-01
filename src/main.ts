console.log('bazbaz');

import glob from 'glob';

console.log('foobar');

glob("**/*.sln", {}, (err, files) => {
    for(let file of files) {
        console.log(file);
    }
});