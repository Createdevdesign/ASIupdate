import express from 'express';
import debug from 'debug';
import authLogService from '../services/authlog.service';
// import vonageService from '../services/vonage.service';
import twilioSmsService from '../services/twiliosms.service';
import { v4 as uuid } from 'uuid';

const log: debug.IDebugger = debug('app:auth-controller');


class AuthLogController {
    
    async sendOTP(req: express.Request, res: express.Response){
        try {
            const clientData: any = req.body.clientData;
            const deviceId:any = req.headers['x-device-id'];
            let ResponseKey = uuid();
            let getFailedAttempts: Boolean = await authLogService.verifyFailedAttemps(clientData.ClientId, deviceId, req.body.phoneNumber);
            if(!getFailedAttempts){
                return res.status(403).send({errors:["After 24 hours this failed attemp will reset."]});
            }
            let sendOtp:any = await twilioSmsService.sendOtpToPhoneNumber(req.body.phoneNumber);
            // return res.status(200).send(sendOtp)
            if(sendOtp.status!=="pending"){
                await authLogService.findByClientIdPhoneNumberDeviceId(clientData.ClientId,req.body, deviceId, req.headers, ResponseKey, "fail")
                return res.status(400).send({errors:sendOtp});
            }
            await authLogService.findByClientIdPhoneNumberDeviceId(clientData.ClientId,req.body, deviceId, req.headers, ResponseKey, "success")
            return res.status(200).send({ResponseKey:ResponseKey, VerificationCodeDigits:4});   
        } catch (error) {
            return res.status(400).send({errors:error});
        }
    }
    
    async smsOtpVerify(req: express.Request, res: express.Response){
        try {
            req.body.ResponseKey = uuid();
            req.body.deviceId = req.headers['x-device-id'];
            req.body.userAgent = req.headers['user-agent'];
            req.body.sourceIp = req.headers['host'];
            
            let verifyAuthLog = await authLogService.verifyResponseKeyId(req.body.response_key);
            if (!verifyAuthLog) {
                return res.status(401).send({errors:['Invalid response key']});
            }
            let smsVerified:any=null;
            let smsOtpVerifY:any = await twilioSmsService.verifyOtpToPhoneNumber(verifyAuthLog, req.body.code);
            // return res.status(200).send(smsOtpVerifY);   
            if(smsOtpVerifY.status === "approved"){
                let verifiedData = await authLogService.findCustomerAfterVerify(verifyAuthLog, req.body)
                await authLogService.findByAuthlogUsingClietId(req.body, verifyAuthLog, "Success")
                smsVerified= verifiedData
            }else{
                await authLogService.findByAuthlogUsingClietId(req.body, verifyAuthLog, "Failed")
                smsVerified= null
            }
            if(smsVerified === null){
                return res.status(401).send({errors:smsOtpVerifY});    
            }
            return res.status(200).send(smsVerified);   
        } catch (error) {
            return res.status(400).send(error);
        }
    }
    
}

export default new AuthLogController();
