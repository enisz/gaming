/**
 * Building the client
 */

 const path = require("path");
 const npmBuild = require(path.join(__dirname, "_npm-build.js"));
 const rmdir = require(path.join(__dirname, "_rmdir.js"));
 const modules = require(path.join(__dirname, "_modules.js"));

 module.exports = Object.assign(
    (cb) => {
        rmdir("client/build")
        .then(() => modules("client"))
        .then(() => npmBuild("client"))
        .then(() => cb())
        .catch(error => cb(error))
    }, { displayName : path.basename(__filename, ".js")}
 );