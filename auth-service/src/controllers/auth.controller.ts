import express from 'express';
import debug from 'debug';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import customerService from '../services/customer.service';
import { v4 as uuid } from 'uuid';
import jwtMiddleware from "@swiftserve/node-common/dist/middleware/jwt.middleware";
import authClientService from '../services/authclient.service';
import awsEmailService from '../services/awsemail.service';
import twilioEmailService from '../services/twilioemail.service';
import * as bcrypt from "bcryptjs";


const log: debug.IDebugger = debug('app:auth-controller');
const ITokenType =  {
    TEMP_STORE_TOKEN:'TEMP_STORE_TOKEN', STORE_TOKEN:'STORE_TOKEN', ANONYMOUS_CUSTOMER_TOKEN:'ANONYMOUS_CUSTOMER_TOKEN', CUSTOMER_TOKEN:'CUSTOMER_TOKEN'
}
// @ts-expect-error
const jwtSecret: string = process.env.JWT_SECRET;
const tokenExpirationInSeconds = 36000;

class AuthController {
    async createJWT(req: express.Request, res: express.Response) {
        try {
            const refreshId = req.body.userId + jwtSecret;
            const salt = crypto.createSecretKey(crypto.randomBytes(16));
            const hash = crypto
                .createHmac('sha512', salt)
                .update(refreshId)
                .digest('base64');
            req.body.refreshKey = salt.export();
            const token = jwt.sign(req.body, jwtSecret, {
                expiresIn: tokenExpirationInSeconds,
            });
            return res
                .status(201)
                .send({ accessToken: token, refreshToken: hash });
        } catch (err) {
            log('createJWT error: %O', err);
            return res.status(500).send();
        }
    }

    async verifyCredentials(req: express.Request, res: express.Response) {
        try {
            const customer: any = await customerService.findCustomerUsingId(req.body.username);
            const cleintData: any = req.body.clientData;
        
            if (
                customer &&
                cleintData &&
                await customerService.checkUserAccess(customer) 
                && await customerService.verifyPassword(req.body.password, customer.Password)
            ) {
                let customerBase64Id = Buffer.from(customer._id).toString("base64");
                const clientBase64Id: String = Buffer.from(cleintData.ClientId).toString("base64");
                let refreshTokenId;
                const payload = {
                    jti: uuid(),
                    sub: customerBase64Id,
                    clientId: clientBase64Id,
                    issuer: process.env.access_token_issuer,
                    firstName: customer.FirstName,
                    lastName: customer.LastName
                };
                await customerService.storeTokenInfo(
                    payload,
                    customer._id,
                    cleintData.ClientId,
                    req.headers,
                    req.body.notificationId,
                    ITokenType.TEMP_STORE_TOKEN,
                    refreshTokenId,
                    cleintData
                );
                const token: string = await jwtMiddleware.createToken(payload, 1800);
                return res
                    .status(200)
                    .send({ access_token: token });
            } else {
                return res.status(403).send();
            }
        } catch (err) {
            log('Bad request', err);
            return res.status(400).send(err);
        }
    }

    async verifyInvalidateCredentials(req: express.Request, res: express.Response) {
        try {
            const deviceId:any = req.headers['x-device-id'];
            if (deviceId) {
                let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
                let verifyDeviceId:any = await customerService.verifyDeviceId(customerId, deviceId);
                if(verifyDeviceId.length === 0){
                    return res.status(401).send({
                        errors: ["Invalid device id"],
                    });   
                }
                const customer: Number = await customerService.invalidateByIdAndDeviceIdAndAccessJti(
                    customerId, deviceId
                );
                if(!customer){
                    return res.status(403).send({
                        errors: ["User does not exists."],
                    });   
                }
                return res.status(200).send();
                
            } else {
                return res.status(401).send();
            }
        } catch (err) {
            return res.status(403).send();
        }
    }

    async verifyAccessTokenCredentials(req: express.Request, res: express.Response) {
        try {
            const deviceId:any = req.headers['x-device-id'];
            const storeId:any = req.headers['x-store-id'];
            
            let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
            const customer: any = await customerService.readById(customerId);
            const clientId:any = Buffer.from(res.locals.jwt.clientId, "base64").toString();
            let clientData = await authClientService.readById(clientId);
            if (
                customer &&
                clientData &&
                await customerService.verifyDeviceId(customerId, deviceId) && 
                await customerService.checkUserAccessStoreId(customer, storeId) &&
                await customerService.verifyUser(customer, storeId)
            ){
                log("Client Authentication Passed.");
                let customerBase64Id = Buffer.from(customer._id).toString("base64");
                const clientBase64Id: String = Buffer.from(clientId).toString("base64");
                let refreshTokenId=uuid();
                let userRoles:any = await customerService.userRoles(customer.AuthorizedStores,storeId);
                if(userRoles === "false"){
                    return res.status(401).send({
                        errors:["No authorized stores found"]
                    });    
                }
                const payload = {
                    jti: uuid(),
                    sub: customerBase64Id,
                    clientId: clientBase64Id,
                    issuer: process.env.access_token_issuer,
                    firstName: customer.FirstName,
                    lastName: customer.LastName,
                    storeId:storeId,
                    roles:userRoles
                };
                await customerService.storeTokenInfo(
                    payload,
                    customer._id,
                    clientId,
                    req.headers,
                    req.body.notificationId,
                    ITokenType.STORE_TOKEN,
                    refreshTokenId,
                    clientData
                );
                const token: string = await jwtMiddleware.createToken(payload, 1800);
                return res.status(200).send({access_token:token, refresh_token:refreshTokenId});            
            }else{
                return res.status(400).send();
            }
            
        } catch (err) {
            log('Bad request', err);
            return res.status(400).send(err);
        }
    }

    async verifyrefreshTokenCredentials(req: express.Request, res: express.Response) {
        try {
            const deviceId:any = req.headers['x-device-id'];
        const storeId:any = req.headers['x-store-id'];
        
        let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
        let tokenType:any = ITokenType.STORE_TOKEN;
        if(req.body.service === "ANONYMOUS"){
            tokenType = ITokenType.ANONYMOUS_CUSTOMER_TOKEN;
        }
        if(req.body.service === "CUSTOMER"){
            tokenType = ITokenType.CUSTOMER_TOKEN;
        }
        let verifyRefreshToken:any = await customerService.verifyRefreshTokenId(customerId,req.body.refresh_token,tokenType);
        if(verifyRefreshToken === false){
            return res.status(401).send({
                errors:["Invalid refresh Token id"]
            });    
        }
        if(verifyRefreshToken === "refresh_token_expired"){
            return res.status(401).send({
                errors:["Refresh Token has expired"]
            });    
        }
        const customer: any = await customerService.readById(customerId);
        const clientId:any = Buffer.from(res.locals.jwt.clientId, "base64").toString();
        let clientData = await authClientService.readById(clientId);
        
        if (
            customer &&
            clientData &&
            await customerService.verifyDeviceId(customerId, deviceId) && 
            (req.body.service === "CUSTOMER"? true:(req.body.service === "STORE" ? await customerService.verifyUser(customer, storeId): await customerService.verifyAnonymousUser(customer)))
        ){
            log("Client Authentication Passed.");
            let customerBase64Id = Buffer.from(customer._id).toString("base64");
            const clientBase64Id: String = Buffer.from(clientId).toString("base64");
            let refreshTokenId=uuid();
            let userRoles:any = await customerService.userRoles(customer.AuthorizedStores,storeId);
            if(req.body.service === "STORE"){
                if(userRoles === "false"){
                    return res.status(401).send({
                        errors:["No authorized stores found"]
                    });    
                }
            }
            if(req.body.service === "ANONYMOUS" || req.body.service === "CUSTOMER"){
                userRoles=[];
                customer.CustomerRoles.filter(data =>{ userRoles.push(data.Name)})
            }
            const payload:any = {
                jti: refreshTokenId,
                sub: customerBase64Id,
                clientId: clientBase64Id,
                issuer: process.env.access_token_issuer,
                roles:userRoles
            };
            if(req.body.service === "STORE"){
                payload.firstName= customer.FirstName;
                payload.lastName= customer.LastName;
                payload.storeId=storeId;
            }
            
            if(req.body.service === "ANONYMOUS"|| req.body.service === "CUSTOMER"){
                var time = new Date();
                payload.unique_name= customer.Username;
                payload.DeviceId=deviceId;
                payload.issued_date= time.getMilliseconds().toString();
                payload.expires_in= time.getMilliseconds().toString();
            }
            await customerService.storeRefreshTokenInfo(
                payload,
                customer._id,
                clientId,
                req.headers,
                clientData
            );
            
            const token: string = await jwtMiddleware.createToken(payload, 1800);
            return res.status(200).send({access_token:token});            
        }else{
            return res.status(400).send();
        }
        } catch (err) {
            log('Bad request', err);
            return res.status(400).send(err);
        }
    }

    async anonymousVerifyCredentials(req: express.Request, res: express.Response) {
        try {
            const deviceId:any =  req.headers['x-device-id'];
            const customer: any = await customerService.findCustomerUsingId(deviceId);
            const cleintData: any = req.body.clientData;
            let token:any="";
            // let customerData:any={};
            let uuidData:any = uuid();
            if(!customer){
                const createCustomer = customerService.customerObject(deviceId, "ANONYMOUS");
                const customerData = await customerService.createCustomer(createCustomer, res);  
                let payload = await customerService.storeCustomerSessionData(customerData, deviceId, uuidData, req.headers, cleintData.ClientId, ITokenType.ANONYMOUS_CUSTOMER_TOKEN);
                token = await jwtMiddleware.createToken(payload, 1800 );
            }
            else{
                let payload = await customerService.storeCustomerSessionData(customer, deviceId, uuidData, req.headers, cleintData.ClientId, ITokenType.ANONYMOUS_CUSTOMER_TOKEN);
                token = await jwtMiddleware.createToken(payload, 1800 );
            }
            return res.status(200).send({access_token:token, refresh_token:uuidData});            
        } catch (err) {
            log('Bad request', err);
            return res.status(400).send(err);
        }
    }

    async changePassword(req: express.Request, res: express.Response) {
        try {
            let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
            
            const customerData: any = await customerService.getUserById(
                customerId
            );
            if(!customerData){
                return res.status(404).send({errors:['No user found']});
            }
            const valid: boolean = bcrypt.compareSync(req.body.newPassword, customerData.Password);
            if (valid) {
                return res.status(401).send({errors:['Your new password is too similar to your current password. Please try another password.']});
            }
            let password;
            let PasswordSalt;
            let PasswordFormatId=256;
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.newPassword, salt);
            password=hash;
            PasswordSalt=salt;
            const customer: any = await customerService.changePasswordUsingCustomerId(
                customerId,
                password,
                PasswordSalt,
                PasswordFormatId
            );
            var templatedata:any={};
            templatedata.name=customer.FirstName;
            await awsEmailService.sendEmailNotification(templatedata,customer.Email,'ResetPassword');
            return res.status(200).send(customer);
        } catch (error) {
            log('Bad request', error);
            return res.status(400).send(error);
        }
    }

    async forgotPassword(req: express.Request, res: express.Response) {
        try {
            const customer: any = await customerService.findCustomerUsingId(req.body.username);
            if (!customer) {
                return res.status(401).send({errors:["Username Not Exist"]});
            }
            let sendOtpToEmail:any = await twilioEmailService.sendOtpToEmail(customer);
            if (sendOtpToEmail.status !== "pending") {
                return res.status(400).send(sendOtpToEmail);
            }
            log("Email verify successfull");
            let customerDataHashKey = customer.GenericAttributes.filter(item=> item.Key === 'hashKey')
            let sendEmailKey:any = null;
            if(customerDataHashKey.length === 0){
                sendEmailKey = await customerService.sendEmailHaskKeyInCustomer(customer, "create");
            }else{
                sendEmailKey = await customerService.sendEmailHaskKeyInCustomer(customer, "update");
            }
            if (!sendEmailKey) {
                return res.status(403).send({errors:["User does not exists."]});
            }
            var data:any={
                HashKey:sendEmailKey,
                VerificationCodeDigits:4
            }
            return res.status(200).send(data);
        } catch (error) {
            return res.status(400).send(error);
        }
    }

    async resetPassword(req: express.Request, res: express.Response) {
        try {
            let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
            const customerData: any = await customerService.readById(customerId);
            if(!customerData){
                return res.status(401).send({errors:['No customer found']});
            }
            
            if (req.body.oldPassword === req.body.newPassword) {
                return res.status(401).send({errors:['New and old password are same']});
            }
            const valid: boolean =  await customerService.verifyPassword(req.body.oldPassword, customerData.Password)
            if(!valid){
                return res.status(401).send({errors:['Invalid password']});
            }
            let password;
            let PasswordSalt;
            let PasswordFormatId=256;
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.newPassword, salt);
            password=hash;
            PasswordSalt=salt;
            const customer: any = await customerService.changePasswordUsingCustomerId(
                customerId,
                password,
                PasswordSalt,
                PasswordFormatId
            );
            var templatedata:any={};
            templatedata.name=customer.FirstName;
            await awsEmailService.sendEmailNotification(templatedata,customer.Email,'PasswordReset');
            return res.status(200).send(customer);
        } catch (error) {
            log('Bad request', error);
            return res.status(400).send(error);
        }
    }

    async forgotPasswordOtpVerify(req: express.Request, res: express.Response) {
        try {
            const customer: any = await customerService.findUserUsingHashKey(req.body);
            if (!customer) {
                return res.status(401).send({errors:["Hashkey Not Exist"]});
            }
            
            let forgotEmailDate:any = customer["PasswordChangeDateUtc"];
            let todayDate: any = new Date();
            let dateTime = Math.floor((todayDate - forgotEmailDate) / (1000 * 60));
            if(dateTime > 10){
                return res.status(404).send({errors:["Your otp is expired, resend otp"]});
            }
            let verifyOtpToEmail:any = await twilioEmailService.verifyOtpToEmail(customer, req.body);
            if (verifyOtpToEmail.status !== "approved") {
                return res.status(400).send(verifyOtpToEmail);
            }
            let customerBase64Id = Buffer.from(customer._id).toString("base64");
            const payload = {
                jti: uuid(),
                sub: customerBase64Id,
                clientId: customerBase64Id,
                issuer: process.env.access_token_issuer,
                firstName: customer.FirstName,
                lastName: customer.LastName
            };
            var data:any= await jwtMiddleware.createToken(payload, 600 );
            return res.status(200).send({token:data});
        } catch (error) {
            console.log("error " + error)
            return res.status(400).send(error);
        }
    }

}

export default new AuthController();
