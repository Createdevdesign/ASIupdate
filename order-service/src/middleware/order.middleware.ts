import express from 'express';
// import * as argon2 from 'argon2';

class OrderMiddleware {
    async validateBodyRequest(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        res.status(200).send();
    }

    async verifyUser(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const roles = res.locals.jwt.roles?res.locals.jwt.roles:res.locals.jwt.role;
        let Role: Boolean = res.locals.jwt.roles?roles.includes('ANONYMOUS'):roles === "ANONYMOUS";
        if(Role){
            return res.status(401).send({errors:["User is not authorized to access"]});    
        }
        next();
    }
    async verifyStoreUser(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const roles = res.locals.jwt.roles;
        let Role: Boolean = roles.includes('ADMIN') || roles.includes('MANAGER') || roles.includes('STAFF') || roles.includes('Manager')
        if(!Role){
            return res.status(401).send({errors:["User is not authorized to access"]});    
        }
        next();
    }
}

export default new OrderMiddleware();
