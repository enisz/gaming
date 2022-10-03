console.clear();

const dotenv = require("dotenv");
const mongoClient = require("mongodb").MongoClient;
const bcrypt = require("bcrypt");
const igdb = require("igdb-api-node").default;
const axios = require("axios");
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

dotenv.config();
const mongo = new mongoClient(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
const actions = [];

// connecting to the database
actions.push(() => new Promise(
    (resolve, reject) => {
        console.log("Connecting to the database");
        mongo.connect()
        .then(() => {
            console.log("Connected Succesfully!");
            resolve();
        })
        .catch(error => {
            console.log("Failed to connect!");
            reject(error)
        });
    }
));

// dropping the database
actions.push(() => new Promise(
    (resolve, reject) => {
        console.log(`Dropping database "${process.env.DB_DB}" if exists.`);
        mongo
            .db(process.env.DB_DB)
            .dropDatabase()
            .then(() => {
                console.log("Done!");
                resolve();
            })
            .catch(error => {
                console.log("Failed to drop database!");
                reject(error);
            })
    }
));

// creating collections
actions.push(() => new Promise(
    (resolve, reject) => {
        console.log("Creating collections");
        const promises = [];

        ["users", "platforms", "platform_families", "games"].forEach(
            collection => {
                console.log("  " + collection);
                promises.push(mongo.db(process.env.DB_DB).createCollection(collection));
            }
        );

        Promise.all(promises)
        .then(() => {
            console.log("Collections Created!");
            resolve();
        })
        .catch(() => {
            console.log("Failed to create collections!");
            reject(error)
        });
    }
));

// adding a default user
actions.push(() => new Promise(
    (resolve, reject) => {
        console.log(`Adding user "enisz" to the database`);
        mongo
            .db(process.env.DB_DB)
            .collection("users")
            .insertOne({
                username: "enisz",
                password: bcrypt.hashSync("enisz", 10),
                theme: "default", // default theme
                email: "enisz@enisz",
                platforms: [6], // default PC platform
                games: {},
                wishlist: {},
                registered: new Date().getTime()
            })
            .then(() => {
                console.log('User "enisz" added succesfully!');
                resolve();
            })
            .catch(error => {
                console.log('Failed to add user "enisz"!');
                reject(error);
            })
    }
));

actions.push(() => new Promise(
    (resolve, reject) => {
        console.log(`Generating random users`);

        axios.get(`https://randomuser.me/api?results=50&nat=us&inc=login,email`)
        .then(res => res.data.results)
        .then(users => {
            console.log(`Fetched ${users.length} users from randomuser.me. Processing...`)
            const promises = [];

            users.forEach(
                (user, index) => {
                    console.log(`  inserting ${user.login.username}`);
                    const threshold = 1000 * 60 * 60 * 24 * 365; // 1 year
                    const registered = randomInt(new Date().getTime() - threshold, new Date().getTime());

                    promises
                        .push(
                            mongo
                                .db(process.env.DB_DB)
                                .collection("users")
                                .insertOne({
                                    username: user.login.username,
                                    password: bcrypt.hashSync(user.login.username, 10),
                                    theme: "default", // default theme
                                    email: user.email,
                                    platforms: [6], // default PC platform
                                    games: {},
                                    wishlist: {},
                                    registered: registered
                                })
                        )
                }
            )

            Promise
                .all(promises)
                .then(() => {
                    console.log("Users inserted succesfully!");
                    resolve();
                })
                .catch(error => {
                    console.log("Failed to insert users!");
                    reject(error);
                })
        })
        .catch(error => {
            console.log("Failed to fetch random users!");
            reject(error);
        });
    }
));

// populating platforms
actions.push(() => new Promise(
    (resolve, reject) => {
        console.log("Fetching platform data from IGDB");
        igdb().multi([
            igdb()
                .query("platform_families", "Platform Families")
                .fields(["id", "name"])
                .limit(100)
                .sort("id asc"),
            igdb()
                .query("platforms", "Platforms")
                .fields(["id", "name", "slug", "platform_logo.id", "platform_logo.image_id", "platform_family"])
                .limit(500)
                .sort("id asc")
        ])
        .request("/multiquery")
        .then(res => res.data)
        .then(
            response => {
                console.log(`Data recieved. ${response[0].result.length} platform family records, ${response[1].result.length} platform records. Inserting to database.`);
                
                Promise.all([
                    mongo.db(process.env.DB_DB).collection("platform_families").insertMany(response[0].result),
                    mongo.db(process.env.DB_DB).collection("platforms").insertMany(response[1].result)
                ])
                .then(() => { console.log("Platform data inserted!"); resolve();})
                .catch(error => { console.log("Failed to insert platform data to the database!"); reject(error)});
            }
        )
        .catch(
            error => {
                console.log("Failed to fetch platform data from IGDB!");
                reject(error);
            }
        )
    }
));

// closing the database connection
actions.push(() => new Promise(
    (resolve, reject) => {
        console.log("Closing database connection");
        mongo.close()
        .then(() => {console.log("Connection closed!"); resolve();})
        .catch(error => {console.log("Failed to close the connection!"); reject(error)});
    }
));

// processing promises
actions.reduce(
    (previousValue, currentValue, currentIndex, array) => {
        return previousValue
            .then(() => {
                console.log(`[ STEP ${currentIndex + 1} ] ================================================================( ${currentIndex + 1} of ${array.length} )`);
                return currentValue();
            })
            .catch(error => { throw error; });
    }, Promise.resolve()
);