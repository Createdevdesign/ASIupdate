//import { logger } from 'morgan';
import dotenv from 'dotenv';
const dotenvResult = dotenv.config();
if (dotenvResult.error) {
    throw dotenvResult.error;
}

import express from 'express';
import * as http from 'http';
import * as bodyparser from 'body-parser';
//import * as expressWinston from 'express-winston';
import cors from 'cors';
import { CommonRoutesConfig } from '@swiftserve/node-common';
import { StoresRoutes } from './stores.routes.config';
//import { AuthRoutes } from './auth/auth.routes.config';
import debug from 'debug';
import helmet from 'helmet';
import fileUpload from 'express-fileupload';

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = 3000;
const routes: Array<CommonRoutesConfig> = [];
import logger from "@swiftserve/node-common/dist/services/logger";

app.use(bodyparser.json());
app.use(fileUpload());
app.use(cors());
app.use(helmet());
app.use((req, res, next) => {
    logger.info(`Requesting ${req.method} ${req.originalUrl}`, {tags: 'http', additionalInfo: {body: req.body, headers: req.headers }});
    next()      
});
//app.use(expressWinston.logger(loggerOptions));

routes.push(new StoresRoutes(app));
//routes.push(new AuthRoutes(app));

app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send(`Server running at http://localhost:${port}`);
});
export default server.listen(port, () => {
    logger.debug(`Server running at http://localhost:${port}`);
    routes.forEach((route: CommonRoutesConfig) => {
        logger.debug(`Routes configured for ${route.getName()}`);
    });
});
