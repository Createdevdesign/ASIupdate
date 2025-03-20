import express from 'express';
// import * as argon2 from 'argon2';

class ConfigMiddleware {
    async validateBodyRequest(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const err = new Error('Not Found');
        // err.status = 404;
        next(err);
    }

    async verifyUser(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const roles = res.locals.jwt.roles;
        let Role: Boolean = roles.includes('ADMIN') || roles.includes('MANAGER')
        if(!Role){
            return res.status(401).send({errors:["User is not authorized to access"]});    
        }
        next();
    }
}

export default new ConfigMiddleware();
