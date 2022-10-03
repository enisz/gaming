const path = require("path");
const log = require("fancy-log");
const fs = require("fs");
const spawn = require("cross-spawn");

module.exports = (directory) => {
    return new Promise(
        (resolve, reject) => {
            log(`Building ${directory}`);

            if(!fs.existsSync(path.join(directory, "node_modules"))) {
                reject(`npm modules are missing in ${directory}`);
            }

            const proc = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ["run", "build"], { cwd : directory });
            const logOutput = data => data.toString().split("\n").filter(line => line.trim().length > 0).map( line => log.info(line.trim()));

            proc.stdout.on("data", logOutput)
            proc.stderr.on("data", logOutput)

            proc.on("exit", code => {
                if(code != 0) {
                    reject("Process failed! Error code: " + code);
                } else {
                    log.info("Modules installed successfully!");
                    resolve();
                }
            })
        }
    );
}