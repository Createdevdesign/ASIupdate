import express from 'express';
import jwt from 'jsonwebtoken';
import { Jwt } from '../types/jwt';

const jwtSecret: string = Buffer.from(process.env.JWT_SECRET_KEY, "base64").toString();
import logger from '../services/logger';

const accessTokenIssuer: any = process.env.access_token_issuer;

class JwtMiddleware {

    validJWTNeeded(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if (req.headers['authorization']) {
            try {
                const authorization = req.headers['authorization'].split(' ');
                if (authorization[0] !== 'Bearer') {
                    return res.status(401).send();
                } else {
                    res.locals.jwt = jwt.verify(
                        authorization[1],
                        jwtSecret
                    ) as Jwt;
                    next();
                }
            } catch (err) {
                logger.error(err);                
                return res.status(403).send();
            }
        } else {
            return res.status(401).send();
        }
    }

    
    async invalidJWTNeeded(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if (req.headers['authorization']) {
            try {
                const authorization = req.headers['authorization'].split(' ');
                if (authorization[0] !== 'Bearer') {
                    return res.status(401).send();
                } else {
                    let decoded:any = await jwt.verify(
                        authorization[1],
                        jwtSecret,
                        {ignoreExpiration: true}
                    );
                    if (decoded && accessTokenIssuer && accessTokenIssuer === decoded.issuer) {
                        // return res.status(200).send(decoded);
                        res.locals.jwt = decoded;
                        next();
                    }else{
                        return res.status(401).send();
                    }
                    
                }
            } catch (err) {
                return res.status(403).send(err);
            }
        } else {
            return res.status(401).send();
        }
    }

    async createToken(payload: any, expiryTime: number) {
        const token: string = jwt.sign(payload, jwtSecret, { expiresIn: expiryTime });
        return token;
    }

    async storeValidJWTNeeded(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if (req.headers['authorization']) {
            try {
                const authorization = req.headers['authorization'].split(' ');
                if (authorization[0] !== 'Bearer') {
                    return res.status(401).send();
                } else {
                    let decoded:any = await jwt.verify(
                        authorization[1],
                        jwtSecret,
                    );
                    if (decoded && accessTokenIssuer && accessTokenIssuer === decoded.issuer) {
                        // return res.status(200).send(decoded);
                        res.locals.jwt = decoded;
                        next();
                    }else{
                        return res.status(401).send();
                    }
                    
                }
            } catch (err) {
                return res.status(403).send(err);
            }
        } else {
            return res.status(401).send();
        }
    }
}

export default new JwtMiddleware();
