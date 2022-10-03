/**
 * Assemble the application
 */

 const path = require("path");
 const npmBuild = require(path.join(__dirname, "_npm-build.js"));
 const copy = require(path.join(__dirname, "_copy.js"));
 const rmdir = require(path.join(__dirname, "_rmdir.js"));
 
 module.exports = Object.assign(
     (cb) => {
         rmdir("build")
         .then(() => copy("server/build", "build"))
         .then(() => copy("client/build", "build/public"))
         .then(() => copy("server/.env", "build"))
         .then(() => copy("server/package.json", "build"))
         .then(() => cb())
         .catch(error => cb(error))
     }, { displayName : path.basename(__filename, ".js")}
 );