const dotenv = require("dotenv");
const mongoClient = require("mongodb").MongoClient;

dotenv.config();
const axios = require("axios").create({ baseURL: "https://api.igdb.com/v4", headers: { "Authorization": `Bearer ${process.env.IGDB_ACCESS_TOKEN}`, "Client-ID": process.env.IGDB_CLIENT_ID }});

new mongoClient(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}`)
    .connect()
    .then(client => {
        
    })
    .catch(error => {throw error})