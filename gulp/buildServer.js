/**
 * Building the server
 */

const path = require("path");
const npmBuild = require(path.join(__dirname, "_npm-build.js"));
const rmdir = require(path.join(__dirname, "_rmdir.js"));
const modules = require(path.join(__dirname, "_modules.js"));

module.exports = Object.assign(
    (cb) => {
        rmdir("server/build")
        .then(() => modules("server"))
        .then(() => npmBuild("server"))
        .then(() => cb())
        .catch(error => cb(error))
    }, { displayName : path.basename(__filename, ".js")}
);