import express from 'express';
import debug from 'debug';
import customerService from '../services/customer.service';
import path from 'path';

class UserController {

    async getCustomerData(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        try {
            let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
            if(req.query.phoneNumber){
                let queryData:any = req.query.phoneNumber;
                if (queryData.length < 10) {
                   return res.status(400).send({errors:["Please enter correct mobile number"]});
                }
            }
            let customerData:any;
            if(req.query.type === "role"){
                customerData = await customerService.getCustomerRoleById(customerId, req.query)
            }else{
                customerData = await customerService.getCustomerById(customerId, req.query)
            }
            if(!customerData){
                return res.status(404).send({errors:[req.query.type === "role"?"get User Roles error":"get User info error"]});
            }
            let finalData = req.query.type === "role"?customerData:{data:customerData};
            return res.status(200).send(finalData);
            // return res.status(200).send(customerData);
        } catch (error) {
            return res.status(404).send({errors:[req.query.type === "role"?"get User Roles error":"get User info error"]});
        }
        
    }

    async getCustomerPreferedNotification(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
        ){
            try {
                let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
                let customerData:any = await customerService.getCustomerPreferenceNotificationUsingCustomerId(customerId)
                if(Object.values(customerData).length === 0){
                    return res.status(404).send({errors:["No user preference notifications"]});
                }
                return res.status(200).send(customerData);
            } catch (error) {
                return res.status(404).send({errors:["No user preference notifications"]});
            }
    }
    async updateCustomerPreferedNotification(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
        ){
            try {
                let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
                let customerData:any = await customerService.updateUserPreferenceNotificaiton(customerId, req.body)
                if(!customerData){
                    return res.status(404).send({errors:["create or update user preference error"]});
                }
                return res.status(201).send();
            } catch (error) {
                return res.status(404).send({errors:["create or update user preference error"]});
            }
    }

    async updateUser(
        req: express.Request,
        res: express.Response
        ){
            try {
                let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
                let customerData:any = await customerService.updateUserByCustomerId(customerId, req.body)
                if(!customerData){
                    return res.status(404).send({errors:["update User info error"]});
                }
                return res.status(201).send();
            } catch (error) {
                return res.status(404).send({errors:["update User info error"]});
            }
    }

    async createUserRating(
        req: express.Request,
        res: express.Response
        ){
            try {
                let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
                let createUserRating:any = await customerService.createCustomerRatingUsingCustomerIdAndBody(customerId, req.body)
                if(!createUserRating){
                    return res.status(404).send({errors:["No customer found"]});
                }
                return res.status(201).send({data:createUserRating});
            } catch (error) {
                return res.status(404).send({errors:["update User info error"]});
            }
    }

    async createEmployee(
        req: express.Request,
        res: express.Response
        ){
            try {
                let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
                const storeId = res.locals.jwt.storeId;
                const roles = res.locals.jwt.roles;
                const body: any = req.body;
                let createUserRating:any = await customerService.createEmployeeUsingCustomerIdAndStoreId(customerId,storeId, roles, body)
                if(!createUserRating){
                    return res.status(404).send({errors:["insert User info error"]});
                }
                return res.status(201).send();
            } catch (error) {
                return res.status(404).send({errors:["insert User info errors"]});
            }
    }

    
    async uploadUserImage(
        req: express.Request,
        res: express.Response
        ){
            try {
                let imageData:any = req.files;
                let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
                let customerUploadImage = await customerService.uploadImageUsingCustomerId(customerId, imageData, res);
                return res.status(200).send({data:customerUploadImage?.Location});
            } catch (error) {
                return res.status(404).send({errors:["Upload image Error"]})
            }
    }
    async updateEmailForCustomer(req: express.Request, res: express.Response) {
        let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
        const updateInfo: any = await customerService.updateEmailForCustomer(customerId, req.body);
        // console.log(customerId + "+++++");
        return res.status(updateInfo.status).send(updateInfo.message);
        
    }
    async createOrUpdateFeedback(req: express.Request, res: express.Response) {
        let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
        const createOrUpdateFeedback: any = await customerService.createOrUpdateFeedback(customerId, req.body);
        console.log(customerId + "+++++");
        return res.status(createOrUpdateFeedback.status).send(createOrUpdateFeedback.message);
        
    }
    async verifyEmail(req: express.Request, res: express.Response) {
        const token = req.query.token;
        console.log(token + "==========================");
        // return res.status(200).send({statuse:"success"});
        const verifyEmail: any = await customerService.verifyEmail(token);
        return res.status(verifyEmail.status).send(verifyEmail.message);
        
    }
}

export default new UserController();
