import express from 'express';

class HeadersMiddleware {

    validRequiredHeaders(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if (!req.headers['x-timezone'] || !req.headers['x-device-id']) {
            return res.status(400).send();
        }
        next();
    }

    validCoordinates(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if (!req.headers['x-lat'] || !req.headers['x-long']) {
            return res.status(400).send();
        }
        next();
    }
}

export default new HeadersMiddleware();
