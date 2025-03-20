import express from 'express';
import storeService from '../services/stores.service';

class StoresMiddleware {
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

    async validateUserExists(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const user = await storeService.readById(req.params.storeId);
        if (user) {
            next();
        } else {
            res.status(404).send({
                errors: [`Store ${req.params.storeId} not found`],
            });
        }
    }

    async extractStoreId(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        req.body.id = req.params.storeId;
        next();
    }

    async verifyUser(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        // const roles = res.locals.jwt.roles;
        const roles = res.locals.jwt.roles?res.locals.jwt.roles:res.locals.jwt.role;
        let Role: Boolean = roles.includes('ADMIN') || roles.includes('MANAGER')|| roles.includes('OWNER')
        if(!Role){
            return res.status(401).send({errors:["User is not authorized to access"]});    
        }
        next();
    }
}

export default new StoresMiddleware();
