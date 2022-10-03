import { Request, Response, Router } from 'express';
import { ModifyResult } from 'mongodb';
import { DecodedJwt } from '../../interface/DecodedJwt';
import Logger from '../../lib/Logger';
import MongoDB from '../../lib/MongoDB';

const router: Router = Router();
const logger = Logger.getLogger(__filename);

router.get("/me", (request: Request, response: Response) => {
    const { uid } = (request.user as DecodedJwt);

    MongoDB.getDb().collection("users").findOne({ _id : MongoDB.objectId(uid) }, {projection: { password: 0 }})
    .then(
        (user: any) => {
            logger.debug(`Sending user information of "${user.username}"`);
            response.status(200).send(user);
        }
    )
    .catch(
        (error: any) => {
            logger.error(error);
            response.status(500).send(error);
        }
    )
});

router.get("/username/:username", (request: Request, response: Response) => {
  const { username } = request.params;

  MongoDB
    .getDb()
    .collection("users")
    .findOne({ username: username}, { projection: { password: 0 }})
    .then(res => {
      if(res === undefined) {
        logger.warn(`Username "${username}" not found in the database!`);
        response.status(404).send({ message: "user not found"});
      } else {
        logger.info(`Sending user data of "${username}" to the client.`);
        response.status(200).send(res);
      }
    })
    .catch(error => {
      logger.error(error);
      response.status(500).send(error);
    });
})

router.put("/platforms", (request: Request, response: Response) => {
    const { uid } = (request.user as DecodedJwt);
    const ids = request.body.map((id: string) => parseInt(id)).sort((a: number, b: number): number => a - b);

    MongoDB.getDb().collection("users").updateOne({ _id: MongoDB.objectId(uid) }, { "$set": {platforms: ids} })
    .then(
        (user: any) => {
            logger.debug("Platforms saved for the user!");
            response.status(200).end();
        }
    )
    .catch(
        (error: any) => {
            logger.error(error);
            response.status(500).send(error);
        }
    )
})

router.delete("/games/:platformId/:gameId/:collection", (request: Request, response: Response) => {
    const { platformId, gameId, collection } = request.params;
    const { uid } = request.user as DecodedJwt;

    const filter: any = {
        _id: MongoDB.objectId(uid)
    }

    let update: any = {
        "$pull" : {}
    }

    update["$pull"][`${collection}.${platformId}`] = parseInt(gameId);

    MongoDB.getDb().collection("users").findOneAndUpdate(filter, update)
    .then((res) => {
        logger.debug(`Game #${gameId} is removed from "${collection}" with platform #${platformId}`);
        response.status(200).end()
    })
    .catch((err) => {
        logger.error(`Failed to remove #${gameId} from "${collection} with platform #${platformId}`);
        logger.error(err);
        response.status(500).send(err)
    })
})

router.put("/games", (request: Request, response: Response) => {
    const {collection, platformId, gameId} = request.body;
    const { uid } = request.user as DecodedJwt;

    logger.debug(`collection: ${collection}, platformId: ${platformId}, gameId: ${gameId}`)

    if(collection !== "games" && collection !== "wishlist") {
        logger.error("Collection is neither games nor wishlist. Something smells fishy...");
        response.status(500).end();
        return;
    }

    logger.info(`Adding game #${gameId} to "${collection}" with platform #${platformId}`);

    let filter: any = {
        _id: MongoDB.objectId(uid)
    }

    filter[`${collection}.${platformId}`] = {
        "$nin" : [
            gameId
        ]
    }

    let update: any = {
        "$push" : {}
    }

    update["$push"][`${collection}.${platformId}`] = gameId;

    MongoDB.getDb().collection("users").findOneAndUpdate(filter, update)
    .then((result: ModifyResult) => {
        if(!result.lastErrorObject?.updatedExisting) {
            logger.warn(`Record is not updated. Probably the game id #${gameId} already exists in the collection "${collection}" with platform id #${platformId}.`);
            response.status(409).end();
        } else {
            logger.info(`Game ID #${gameId} added to "${collection}" with platform id of #${platformId}!`);
            response.status(200).end();
        }
    })
    .catch((error) => {
        logger.error(error);
        response.status(500).send(error);
    })
})

router.get("/collection", (request: Request, response: Response) => {
    const { uid, unm } = request.user as DecodedJwt;
    const { collection } = request.query;

    if(collection !== "games" && collection !== "wishlist") {
        logger.error(`Collection is "${collection}". Should be games or wishlist.`);
        response.status(500).end();
        return;
    }

    const pipeline = [
      {
        '$match': {
          '_id': MongoDB.objectId(uid)
        }
      }, {
        '$project': {
          'items': {
            '$objectToArray': `$$ROOT.${collection}`
          }
        }
      }, {
        '$unwind': {
          'path': '$items'
        }
      }, {
        '$addFields': {
          'items.k': {
            '$toInt': '$items.k'
          }
        }
      }, {
        '$lookup': {
          'from': 'platforms',
          'localField': 'items.k',
          'foreignField': 'id',
          'as': 'platform',
          'pipeline': [
            {
              '$project': {
                '_id': 0,
                'id': 1,
                'name': 1,
                'slug': 1
              }
            }
          ]
        }
      }, {
        '$unwind': {
          'path': '$platform'
        }
      }, {
        '$lookup': {
          'from': 'games',
          'localField': 'items.v',
          'foreignField': 'id',
          'as': 'games',
          'pipeline': [
            {
              '$project': {
                '_id': 0,
                'id': 1,
                'cover': 1,
                'name': 1,
                'slug': 1
              }
            }, {
              '$sort': {
                'name': 1
              }
            }
          ]
        }
      }, {
        '$project': {
          '_id': 0,
          'items': 0
        }
      }, {
        '$sort': {
          'platform.name': 1
        }
      }
    ]

    MongoDB.getDb().collection("users").aggregate(pipeline)
    .toArray()
    .then(
        res => {
            logger.debug(`Sending ${collection} of ${unm} to the client`)
            response.status(200).send(res);
        }
    )
    .catch(
        err => {
            logger.error(err);
            response.status(500).send(err);
        }
    )
})

router.get("/all", (request: Request, response: Response) => {
  // const { page, limit } = request.query;
  const page = parseInt(request.query.page as string);
  const limit = parseInt(request.query.limit as string);

  logger.debug(`page: ${page}, type: ${typeof page}`)
  logger.debug(`limit: ${limit}, type: ${typeof limit}`)


  if(isNaN(page) || isNaN(limit)) {
    response.status(500).send({ message: "Page and / or Limit parameter is missing or invalid!"});
    return;
  }

  const pipeline = [
    {
      '$sort': {
        'username': 1
      }
    }, {
      '$group': {
        '_id': null,
        'users': {
          '$push': {
            '_id': '$_id',
            'username': '$username',
            'registered': {
              '$toLong': {
                '$toDate': '$_id'
              }
            }
          }
        },
        'count': {
          '$count': {}
        }
      }
    }, {
      '$project': {
        '_id': 0,
        'count': 1,
        'users': {
          '$slice': [
            '$users', ((page - 1) * limit), limit
          ]
        }
      }
    }, {
      '$addFields': {
        'page': page,
        'limit': limit
      }
    }
  ]

  MongoDB.getDb().collection("users").aggregate(pipeline).toArray()
  // MongoDB.getDb().collection("users").find({}, {projection: { username: 1, registered: 1 }, sort: { username: 1} }).toArray()
  .then(users => {
    logger.debug("Sending user list to client");
    response.status(200).send(users);
  })
  .catch(error => response.status(500).send(error))
});

export const UserController: Router = router;