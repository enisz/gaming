import Express, { Router, Express as App } from 'express';
import Logger from './Logger';
import Path from 'path';

const logger = Logger.getLogger(__filename);

export default class Server {

    private port: number;

    private app: App;
    
    public constructor(port?: number) {
        this.port = port || parseInt(process.env.SERVER_PORT as string);

        logger.info(`Creating server with port ${this.port}`);
        this.app = Express();
    }

    public mountRoute(path: string, controller: Router): void {
        this.app.use(path, controller);
    }

    public middleware(middleware: any): void {
        this.app.use(middleware);
    }

    public listen(): void {
        this.app.use(Express.static(Path.join(__dirname))) // ez biztos nem lesz jó
        this.app.listen(this.port, () => logger.info(`The server is listening on port ${this.port}`));
    }
}