import express from 'express';
import debug from 'debug';
import GoogleAuthService from '../services/googleauth.service';
import AppleAuthService from '../services/appleauth.service';
import AppleBundleAuthService from '../services/applebundleauth.service';
import { GoogleSignInVerification } from "../interfaces";

const log: debug.IDebugger = debug('app:auth-controller');
const ITokenType =  {
    TEMP_STORE_TOKEN:'TEMP_STORE_TOKEN', STORE_TOKEN:'STORE_TOKEN', ANONYMOUS_CUSTOMER_TOKEN:'ANONYMOUS_CUSTOMER_TOKEN', CUSTOMER_TOKEN:'CUSTOMER_TOKEN'
}
// @ts-expect-error
const jwtSecret: string = process.env.JWT_SECRET;
const tokenExpirationInSeconds = 36000;

class SocailAuthController {
    async socialLoginAuthentication(req: express.Request, res: express.Response) {
        

        const authType = req.body && req.body['authType'] || "NONE";

        let result:any = { message: "UnAuthorized Access." }
        switch (authType) {
            case "Google":
                result = await initAuthLogin(GoogleAuthService)(req, res);
                break;
            case "AppleAuth":
                result = await initAuthLogin(AppleAuthService)(req, res);
                break
            case "Apple":
                result = await initAuthLogin(AppleBundleAuthService)(req, res);
                break
            default:
                return result;
        }
        if(result === null){
            return res.status(403).send({errors:["Please reach out to the your manager for access"]});    
        }
        return res.status(200).send(result);
        // return result;
    }

}

const initAuthLogin = (authService: GoogleSignInVerification) =>async (req:any, res:any) => {
    const authType = req.body && req.body['authType'] || null;
    const idToken = req.body && req.body['idToken'] || null;
    const requestBody = {
        deviceId: req.headers['x-device-id'],
        userAgent: req.headers["user-agent"],
        sourceIp: req.headers["host"],
        clientId: req.body.clientData.ClientId,
        body: req.body,
        headers: req.headers
    };
    
    authService.setRequestData(authType, idToken, requestBody)
    let getAccessToken = await authService.verifyAuthToken(res);
    return getAccessToken;
}

export default new SocailAuthController();
