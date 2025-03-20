import express from 'express';
import authClientService from '../services/authclient.service';
// import * as argon2 from 'argon2';

class AuthMiddleware {
    async validateBodyRequest(
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

    async verifyUserPassword(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
 //       const user: any = await usersService.getUserByEmailWithPassword(
 //           req.body.email
 //       );
  //      if (user) {
            const passwordHash = '';//user.password;
            // if (await argon2.verify(passwordHash, req.body.password)) {
                // req.body = {
 //                   userId: user._id,
 //                   email: user.email,
                    // provider: 'email',
 //                   permissionLevel: user.permissionLevel,
                // };
                
 /*           } else {
                res.status(400).send({
                    errors: ['Invalid email and/or password'],
                });
            }*/
        // } else {
            return next();
            // res.status(400).send({ errors: ['Invalid email and/or password'] });
        // }
    }

    async validateAuthBodyRequest(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if (req.body && req.body.username && req.body.password && req.body.notificationId) {
            next();

            // res.status(200).send(req.headers);
        } else {
            res.status(400).send({
                errors: ['Missing required fields: username and password and notificationId'],
            });
        }
    }

    async validateClientIdAndSecret(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const clientIdAndSecret:any = req.headers['Authorization'] ? req.headers['Authorization'] :  req.headers['authorization'];
        if (clientIdAndSecret) {
            const decode = Buffer.from(clientIdAndSecret, "base64").toString();
            const decodeSPlit = decode.split(":");
            const clientId = decodeSPlit[0];
            const valid: any = await authClientService.readById(
                clientId
            );
            if(valid){
                req.body.clientData = valid;
                next();
            }else{
                res.status(401).send();  
            }
            
            
        } else {
            res.status(403).send();
        }
    }

    async verifyService(req: express.Request, res: express.Response,
        next: express.NextFunction) {
        let verifyService:any = req.body.service.includes('STORE') ||req.body.service.includes('CUSTOMER') || req.body.service.includes('ANONYMOUS')
        if(!verifyService){
            return res.status(401).send({
                errors:["Invalid service, please pass correct service like CUSTOMER, ANONYMOUS"]
            });  
        }else{
            next();
        }
    }
}

export default new AuthMiddleware();
