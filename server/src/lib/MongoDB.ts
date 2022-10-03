import { ObjectId } from 'mongodb';
import { MongoClient, Db } from 'mongodb';
import Logger from './Logger';

const logger = Logger.getLogger(__filename);

export default class MongoDB {

    private static mongoClient: MongoClient;
    private static db: Db;

    public static connect(url: string, username: string, password: string, database: string, port: number = 27017): Promise<any> {
        return new Promise(
            (resolve: Function, reject: Function) => {
                logger.debug(`mongodb://${username}:${password}@${url}:${port}`);
                this.mongoClient = new MongoClient(`mongodb://${username}:${password}@${url}:${port}`);
                this.mongoClient.connect()
                .then(() => {
                    this.db = this.mongoClient.db(database);
                    resolve();
                })
                .catch((error: any) => reject(error));
            }
        );
    }

    public static getClient(): MongoClient {
        return this.mongoClient;
    }

    public static getDb(): Db {
        return this.db;
    }

    public static objectId(id: string): ObjectId {
        return new ObjectId(id);
    }

    public static generateObjectId(): ObjectId {
        return new ObjectId();
    }
}