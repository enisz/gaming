import { Request, Response, Router } from 'express';
import Logger from '../../lib/Logger';
import MongoDB from '../../lib/MongoDB';
import Bcrypt from 'bcrypt';
import JsonWebToken from 'jsonwebtoken';
import { DecodedJwt } from '../../interface/DecodedJwt';

const router: Router = Router();
const logger = Logger.getLogger(__filename);

router.put("/user", (request: Request, response: Response) => {
    const { uid } = (request.user as DecodedJwt);
    const userData = request.body;

    if(userData.password) {
        userData.password = Bcrypt.hashSync(userData.password, 10)
    }

    const filter = { _id: MongoDB.objectId(uid)}
    const update = { "$set": userData };

    MongoDB.getDb().collection("users").updateOne(filter, update)
    .then(
        () => {
            logger.debug(`Updated user by id "${uid}".`);
            response.status(200).end();
        }
    )
    .catch(
        (error: any) => {
            logger.error("Failed to update user document!");
            logger.error(error);
            response.status(500).send(error);
        }
    );
})

router.post("/login", (request: Request, response: Response) => {
    const { username, password, remember } = request.body;

    logger.debug(JSON.stringify({ username: username, password: "*".repeat(password.length), remember: remember}, null, 2));

    if(username == undefined || password == undefined) {
        logger.error("Bad Request. Username and / or password is empty");
        response.status(400).end();
        return;
    }

    MongoDB.getDb().collection("users").findOne({ username: username })
    .then(
        (user: any) => {
            if(user === undefined) {
                logger.debug(`User "${username}" not found!`);
                response.status(403).end();
            } else {
                logger.debug(`User "${username}" found. Checking password.`);
                if(Bcrypt.compareSync(password, user.password)) {
                    logger.debug("Credentials are OK! Sending JWT token to client.");
                    const jwt = JsonWebToken.sign(
                        { uid: user._id, unm: user.username },
                        process.env.JWT_SECRET as string,
                        { expiresIn: remember ? "365 days" : "24h" }
                    )

                    response.status(200).send({ jwt: jwt, theme: user.theme });
                } else {
                    logger.debug("Password is invalid!");
                    response.status(403).end();
                }
            }
        }
    )
    .catch(
        () => response.status(500).end()
    );
})

router.post("/register", (request: Request, response: Response) => {
    const { username, password, email } = request.body;

    logger.debug(JSON.stringify({ username: username, password: "*".repeat(password.length), email: email }, null, 2));

    if(username === undefined || password === undefined || email === undefined) {
        logger.error("Bad Request! One of the fields is empty.");
        response.status(400).end();
        return;
    }

    const collection = MongoDB.getDb().collection("users");

    logger.debug(`Checking if username "${username}" is taken.`);
    collection.findOne({ username: username })
    .then(
        (user: any) => {
            if(user !== undefined) {
                logger.debug(`"${username}" is already taken.`);
                response.status(409).end();
            } else {
                logger.debug(`"${username}" is available. Inserting user.`);
                collection.insertOne({
                    username: username,
                    password: Bcrypt.hashSync(password, 10),
                    theme: "default", // default theme
                    email: email,
                    platforms: [6], // default PC platform
                    games: {},
                    wishlist: {}
                })
                .then(() => {
                    logger.debug(`"${username}" inserted!`);
                    response.status(200).end();
                })
                .catch((error: any) => {
                    logger.error("Failed to insert user!");
                    logger.error(error);
                    response.status(500).end();
                })
            }
        }
    )
    .catch((error: any) => {
        logger.error(`Failed to fetch user data!`);
        logger.error(error);
        response.status(500).end()
    });
})

export const AuthController: Router = router;