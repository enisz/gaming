/**
 * Deleting a folder recursively
 */

const path = require("path");
const log = require("fancy-log");
const fs = require("fs");

module.exports = (directory) => {
    return new Promise(
        (resolve, reject) => {
            log.info("Deleting folder: " + directory);

            if(!fs.existsSync(directory)) {
                log.info("Folder does not exist... skipping");
                resolve();
            } else {
                rmdir(directory);
                resolve();
            }
        }
    );
}

const rmdir = folder => {
    fs.readdirSync(folder).forEach(
        item => {
            if(fs.lstatSync(path.join(folder, item)).isDirectory()) {
                log.info("Clearing " + path.join(folder, item));
                rmdir(path.join(folder, item));
            } else {
                log.info("Deleting " + path.join(folder, item));
                fs.unlinkSync(path.join(folder, item));
            }
        }
    )

    log.info("Deleting " + folder);
    fs.rmdirSync(folder);
}