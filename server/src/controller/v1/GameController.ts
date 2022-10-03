import { Request, Response, Router } from 'express';
import Logger from '../../lib/Logger';
import IGDB from 'igdb-api-node';
import MongoDB from '../../lib/MongoDB';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en'
import { Document } from 'mongodb';
import { DecodedJwt } from '../../interface/DecodedJwt';
import { Collection, User } from '../../interface/User';
import { Game } from '../../interface/Game';

const router: Router = Router();
const logger = Logger.getLogger(__filename);
TimeAgo.addDefaultLocale(en);
const dateParser = require("node-date-parser");

router.get("/search/:term", (request: Request, response: Response) => {
    const { term } = request.params;
    const { uid } = request.user as DecodedJwt;

    MongoDB.getDb().collection("users").findOne({ _id : MongoDB.objectId(uid)})
    .then(
        (user) => {
            IGDB()
            .fields(["id", "name", "category", "cover.image_id", "slug", "first_release_date", "platforms.name", "total_rating"])
            .search(term)
            .limit(100)
            .where(`platforms = (${user?.platforms.join(",")})`)
            .where(`category = (0,4,8,9) & version_parent = null & platforms = (${user?.platforms.join(",")})`)
            // .where("category = 0")
            .request("/games")
            .then(res => response.status(200).send(res.data))
        }
    )
    .catch(err => {
        logger.error(err);
        response.status(500).send(err)
    })
})

router.get("/versions/:parent_id", (request: Request, response: Response) => {
    const { parent_id } = request.params;

    IGDB()
    .fields(["name", "slug", "version_title"])
    .where(`version_parent = ${parent_id} | id = ${parent_id}`)
    .limit(20)
    .sort("id", "asc")
    .request("/games")
    .then(res => res.data)
    .then(games => {
        logger.info("Sending version children to client");
        response.status(200).send(games);
    })
    .catch(error => {
        logger.error(error);
        response.status(500).send(error);
    })
});

router.get("/data/:id/:slug", (request: Request, response: Response) => {
    const { id, slug } = request.params;
    const { uid } = request.user as DecodedJwt

    const findIds = (collection: Collection, gameId: number): number[] => {
        const ids: number[] = [];

        for(let index in collection) {
            if(collection[parseInt(index)].indexOf(gameId) !== -1) {
                ids.push(parseInt(index));
                continue;
            }
        }

        return ids;
    }

    Promise.all([
        MongoDB.getDb().collection("games").findOne({ slug : slug }),
        MongoDB.getDb().collection("users").findOne({ _id: MongoDB.objectId(uid)})
    ])
    .then(
        result => {
            const game: Game = result[0] as any;
            const user: User = result[1] as any;
            const games: number[] = [];
            const wishlist: number[] = [];
            let synchronize: boolean;
            let exists: boolean;

            if(game === undefined) {
                logger.debug("Game is not cached yet. Need to fetch details from IGDB");
                exists = false;
                synchronize = true;
            } else {
                exists = true;
                logger.debug("Game found in the database. Checking age of the record.");

                const current = new Date();
                const created = new Date();
                created.setTime(game.cached);
                const daysToKeep = 30;
                const keep = 1000 * 60 * 60 * 24 * daysToKeep;
                const age = current.getTime() - created.getTime();

                logger.debug(`Record created at ${dateParser.parse("Y-m-d H:i:s", created)} (${new TimeAgo('en-US').format(created)})`)

                if(age > keep) {
                    logger.debug(`Record is outdated (older than ${daysToKeep} days). Updating...`);
                    synchronize = true;
                } else {
                    logger.debug(`Record is up to date (not older than ${daysToKeep} days)`);
                    synchronize = false;
                }
            }

            if(synchronize) {
                logger.debug("Fetching game details from IGDB.");

                IGDB()
                    .multi([
                        IGDB()
                            .query("games", "main")
                            .fields(["id", "name", "cover.image_id", "artworks.image_id", "first_release_date", "platforms.name", "screenshots.image_id", "slug", "storyline", "summary", "videos.name", "videos.video_id", "total_rating"])
                            .where(`id = ${id}`),
                        IGDB()
                            .query("games", "bundles")
                            .fields(["id", "name", "version_title"])
                            .where(`version_parent = ${id} & category = 3`),
                        IGDB()
                            .query("games", "dlcs")
                            .fields(["id", "name"])
                            .where(`parent_game = ${id} & category = 1`)
                    ])
                    .request("/multiquery")
                    .then(res => res.data)
                    .then((resultSet: any[]) => {
                        let gameRecord = resultSet[0].result[0];
                        gameRecord.bundles = resultSet[1].result;
                        gameRecord.dlcs = resultSet[2].result;
                        gameRecord.cached = new Date().getTime();
                        let promise: Promise<any>;

                        logger.debug(`${exists ? "Replacing" : "Insering"} "${gameRecord.name}" [#${gameRecord.slug}]`);

                        promise = exists
                            ? MongoDB.getDb().collection("games").findOneAndReplace({ id: id }, gameRecord)
                            : MongoDB.getDb().collection("games").insertOne(gameRecord);

                        promise
                        .then(() => {
                            logger.debug(`Record ${exists ? "updated" : "inserted"}! Sending data to client`);
                            delete gameRecord.cached;
                            response.status(200).send({ game: gameRecord, games: findIds(user.games, parseInt(id)), wishlist: findIds(user.wishlist, parseInt(id))});
                        })
                        .catch((error: any) => {
                            logger.error(`Failed to update the game record!`);
                            response.status(500).send(error);
                        });
                    })
            } else {
                logger.debug("Sending cached data to the client from database.");
                const { cached, ...gameData } = game as Document;
                response.status(200).send({
                    game: gameData,
                    games: findIds(user.games, parseInt(id)),
                    wishlist: findIds(user.wishlist, parseInt(id))
                });
            }
        }
    )
    .catch((error: any) => {
        logger.error(error);
        response.status(500).send(error);
    });
})

export const GameController: Router = router;