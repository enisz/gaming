/**
 * Copy task
 */

 const path = require("path");
 const log = require("fancy-log");
 const fs = require("fs");
 
 module.exports = (from, to, exclude = undefined) => {
     return new Promise(
         (resolve, reject) => {
             log.info("Copy resource from: " + from + " to " + to);
 
             if(exclude != undefined) {
                 log.info("Exclude list: " + exclude.join(", "));
             }
 
             if(fs.lstatSync(from).isFile()) {
                 fs.copyFileSync(from, path.join(to, path.basename(from)));
             } else {
                 mkdir(to);
                 copy(from, to, exclude);
             }
 
             resolve();
         }
     );
 }
 
 const mkdir = folder => {
     let concat = "";
 
     folder.split(path.sep).forEach(
         segment => {
             concat = path.join(concat, segment);
             if(!fs.existsSync(concat) || !fs.lstatSync(concat).isDirectory()) {
                 fs.mkdirSync(concat);
             }
         }
     )
 }
 
 const copy = (from, to, exclude) => {
     fs.readdirSync(from).forEach(
         item => {
             for(let x in exclude) {
                 if(path.join(from, item).endsWith(exclude[x])) {
                     return;
                 }
             }
 
             if(fs.lstatSync(path.join(from, item)).isDirectory()) {
                 log.info("Creating folder: " + path.join(to, item));
                 mkdir(path.join(to, item));
                 copy(path.join(from, item), path.join(to, item));
             } else {
                 log.info("Copy " + path.join(from, item) + " to " + path.join(to, item));
                 fs.copyFileSync(path.join(from, item), path.join(to, item));
             }
         }
     )
 }