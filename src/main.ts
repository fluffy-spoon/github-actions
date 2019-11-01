import glob from 'glob';

glob("**/*.sln", {}, (err, files) => {
    for(let file of files) {
        console.log(file);
    }
});