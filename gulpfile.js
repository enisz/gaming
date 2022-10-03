const path = require("path");
const fs = require("fs");
const series = require("gulp").series;
const log = require("fancy-log");

const taskPath = path.join(__dirname, "gulp");
const task = {};

// loading tasks
fs.readdirSync(taskPath, { encoding : "utf-8"})
    .filter(file => !file.startsWith("_") && fs.lstatSync(path.join(taskPath, file)).isFile())
    .forEach(file => task[path.basename(file, ".js")] = require(path.join(taskPath, file)))

exports.buildServer = task.buildServer;
exports.buildClient = task.buildClient;
exports.build = series(task.buildServer, task.buildClient, task.assemble);
exports.default = cb => {
    log("Loaded tasks: " + Object.keys(task).join(", "));
    cb();
}