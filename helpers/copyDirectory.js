const fs = require('fs');
const path = require('path');

function copyDirectory(source, target) {
    fs.mkdirSync(target, { recursive: true });

    let items = fs.readdirSync(source);

    items.forEach(item => {
        let sourceItemPath = path.join(source, item);
        let targetItemPath = path.join(target, item);

        let stat = fs.statSync(sourceItemPath);

        if (stat.isFile()) {
            fs.copyFileSync(sourceItemPath, targetItemPath);
        } else if (stat.isDirectory()) {
            copyDirectory(sourceItemPath, targetItemPath);
        }
    });
}

module.exports = copyDirectory;