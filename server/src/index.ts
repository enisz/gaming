console.clear();

import Express, { NextFunction, Request, Response } from 'express';
import MongoDB from './lib/MongoDB';
import Dotenv from 'dotenv';
import Logger from './lib/Logger';
import {
    AuthController,
    GameController,
    PlatformsController,
    UserController
} from './controller/v1'
import ExpressJwt from 'express-jwt';
import Path from 'path';
import { Server } from 'socket.io';
import Http from 'http';

Dotenv.config();

const logger = Logger.getLogger(__filename);
const app = Express();
const server = Http.createServer(app);
const io = new Server(server);
const { DB_HOST, DB_USER, DB_PASS, DB_DB, DB_PORT } = process.env;

io.on("connection", (socket) => {
    logger.debug("User Connected");

    socket.on("disconnect", () => {
        logger.debug("User Disconnected")
    })
})

MongoDB.connect(DB_HOST as string, DB_USER as string, DB_PASS as string, DB_DB as string, parseInt(DB_PORT as string))
.then(() => logger.info(`Connected to the database "${DB_DB}" at "${DB_HOST}" on port ${DB_PORT}`))
.catch((error: any) => { logger.error("Failed to connect to the database!"); logger.debug(error); throw error;});

app.use((request: Request, response: Response, next: NextFunction) => {
    logger.debug(`[${request.method.toUpperCase()}] ${request.path}`);
    next();
})

app.use(Express.static(Path.join(__dirname, "public")));
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use(
    ExpressJwt(
        {
            secret: process.env.JWT_SECRET as string,
            algorithms: ["HS256"]
        }
    )
    .unless(
        {
            path: [
                '/api/v1/auth/login',
                '/api/v1/auth/register',
                '/api/v1/auth/jwt',
                /^(?!\/api).*$/
            ]
        }
    )
);

app.use("/api/v1/auth", AuthController);
app.use("/api/v1/game", GameController);
app.use("/api/v1/platforms", PlatformsController);
app.use("/api/v1/user", UserController);

app.get("*", (request: Request, response: Response) => {
    logger.info("Serving index.html");
    response.sendFile(Path.join(__dirname, "public", "index.html"))
})

server.listen(process.env.SERVER_PORT, () => logger.info(`Server is listening on port ${process.env.SERVER_PORT}.`))

// mongodb://mongodb:Macisajt87@threadripper:27017