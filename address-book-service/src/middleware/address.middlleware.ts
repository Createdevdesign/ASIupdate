import express from 'express';
import addressService from '../services/address.service';

class AddressMiddleware {
    async validateRequiredStoreBodyFields(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if (req.body && req.body.email && req.body.password) {
            next();
        } else {
            res.status(400).send({
                errors: ['Missing required fields: email and password'],
            });
        }
    }

    async validateSameStoreDoesntExist(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        //const user = await storeService.getUserByEmail(req.body.email);
        //if (user) {
        //    res.status(400).send({ errors: ['User email already exists'] });
        //} else {
            next();
        //}
    }
}
export default new AddressMiddleware();