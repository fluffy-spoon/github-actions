import glob = require('glob');

glob("**/*.sln", null, (err, files) => {
    for(let file of files) {
        console.log(file);
    }
});