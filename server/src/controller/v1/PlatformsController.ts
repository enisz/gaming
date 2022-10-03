import { Request, Response, Router } from 'express';
import Logger from '../../lib/Logger';
import MongoDB from '../../lib/MongoDB';

const router: Router = Router();
const logger = Logger.getLogger(__filename);

router.get("/group", (request: Request, response: Response) => {

    const query = [
        {
          '$group': {
            '_id': '$platform_family', 
            'count': {
              '$count': {}
            }, 
            'platforms': {
              '$addToSet': {
                'id': '$id', 
                'name': '$name', 
                'slug': '$slug'
              }
            }
          }
        }, {
          '$unwind': {
            'path': '$platforms', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$sort': {
            'platforms.name': 1
          }
        }, {
          '$group': {
            '_id': '$_id', 
            'count': {
              '$count': {}
            }, 
            'platforms': {
              '$push': '$platforms'
            }
          }
        }, {
          '$lookup': {
            'from': 'platform_families', 
            'localField': '_id', 
            'foreignField': 'id', 
            'as': 'platform_family', 
            'pipeline': [
              {
                '$project': {
                  '_id': 0
                }
              }
            ]
          }
        }, {
          '$unwind': {
            'path': '$platform_family', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$project': {
            'id': '$_id', 
            '_id': 0, 
            'count': '$count', 
            'platforms': 1, 
            'family': {
              '$ifNull': [
                '$platform_family.name', 'Other'
              ]
            }
          }
        }, {
          '$sort': {
            'family': 1
          }
        }
      ]



    // const query = [
    //     {
    //         "$sort" : {
    //             "name" : 1
    //         }
    //     },
    //     {
    //         "$group" : {
    //             "_id" : {
    //                 "$ifNull" : [
    //                     "$platform_family.name",
    //                     "Other"
    //                 ]
    //             },
    //             "count": {
    //                 "$count": {}
    //             },
    //             "items": {
    //                 "$push" : "$$ROOT"
    //             }
    //         }
    //     },
    //     {
    //         "$sort" : {
    //             "_id" : 1
    //         }
    //     }
    // ]

    MongoDB.getDb().collection("platforms").aggregate(query).toArray()
    .then(
        (result: any) => {
            logger.debug("Sending results to client");
            response.status(200).send(result);
        }
    )
    .catch(
        (error: any) => {
            logger.error("Failed to query platforms");
            logger.error(error);
            response.status(500).send(error);
        }
    )
})

export const PlatformsController: Router = router;