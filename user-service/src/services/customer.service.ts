import { CRUD } from '@swiftserve/node-common';
import { CreateAuthClientDto } from '../dto/create.user.dto';
import { PutStoreDto } from '../dto/put.user.dto';
import { PatchStoreDto } from '../dto/patch.user.dto';
import customerDao from '../daos/customer.dao';
import customerRoleDao from '../daos/customerroles.dao';
import customerRatingDao from '../daos/customerratings.dao';
import awsEmailService from './aws.service';
import awsEmailServiceVerify from './awsemail.service';
import debug from 'debug';
var DateTime =require('node-datetime');
const {v4 : uuidv4} = require('uuid');

const log: debug.IDebugger = debug('app:customer-service');
// @ts-expect-error
const jwtSecret: string = process.env.JWT_SECRET;

class CustomerService implements CRUD {
    async create(resource: CreateAuthClientDto) {
        // return StoresDao.addStore(resource);
    }

    async deleteById(id: string) {
        return "data";
    }

    async list(limit: number, page: number) {
        // return StoresDao.getStores(limit, page);
    }

    async patchById(id: string, resource: PatchStoreDto): Promise<any> {
        // return StoresDao.updateStoreById(id, resource);
    }

    async putById(id: string, resource: PutStoreDto): Promise<any> {
        // return StoresDao.updateStoreById(id, resource);
    }

    async updateById(id: string, resource: CreateAuthClientDto): Promise<any> {
        // return AuthClientDao.updateStoreById(id, resource);
    }
    async readById(id: string) {
        return "data"
    }
    async getCustomerById(id: string, queryData:any) {
        let customerData:any = await customerDao.findCustomerUsingCustomerId(id, queryData);
        if(!queryData.phoneNumber){
            // let deletedData:any = customerData;
            delete customerData.CustomerSID;
            // customerData=deletedData
        }
        return customerData
    }

    async getCustomerPreferenceNotificationUsingCustomerId(id:string){
        let getUserInfo:any = await customerDao.findPreferenceNotificationUsingCustomerId(id);
        let preferredData = {}
        getUserInfo.GenericAttributes.filter(item=> {
            if(item.Key === "preferred-notifications"){
                preferredData[item.Key] = JSON. parse(item.Value)
            }
        })
        return preferredData;
    }

    async updateUserPreferenceNotificaiton(customerId, body){
        var bodyData = {
          "Key":"preferred-notifications",
          "Value":JSON.stringify(body['preferred-notifications']),
          "StoreId":""
        }
        let updateUserPreferenceInfo = await customerDao.updateUserPreferenceByCustomerId(customerId, bodyData);
        return updateUserPreferenceInfo;
    }
    async updateUserByCustomerId(customerId, body){
        let bodyData={
            "FirstName": body.firstName,
            "LastName": body.lastName,
            "DisplayName": body.displayName,
        }
        let updateUserPreferenceInfo = await customerDao.updateUserByCustomerIdAndBody(customerId, bodyData);
        return updateUserPreferenceInfo;
    }

    
    async getCustomerRoleById(id: string, queryData:any) {
        let customerData:any = await customerRoleDao.findUserRolesusingCustomerId(id, queryData);
        return customerData
    }

    async createCustomerRatingUsingCustomerIdAndBody(customerId: string, body:any) {
        let userRatingInfor = await customerRatingDao.findUserRatingsusingCustomerId(customerId);
        let createUserRating:any = null;
        if(userRatingInfor){
        let storeIdData = userRatingInfor.CustomerRatings.filter(item=> item.StoreId === body.storeId);
        if(storeIdData.length !== 0){
            createUserRating = await customerRatingDao.findOneAndUpdateUserRating(customerId, body);
        }else{
            createUserRating = await customerRatingDao.findOneAndUpdatePushUserRating(customerId, body);
        }
        }else{
        let bodyData:any = {
            CustomerId:customerId,
            CustomerRatings:[
            {
                StoreId: body.storeId,
                Ratings: body.ratings
            }
            ]
        }
        createUserRating = await customerRatingDao.createUserRatings(bodyData);
        }
        let service = await customerRatingDao.findUserTotalRating(customerId, body);      
        console.log("service", service)
        return createUserRating
    }


    async createEmployeeUsingCustomerIdAndStoreId(customerId:string, storeId:string, roles:any, body:any) {
        log("customerId", customerId);
        body["Active"]=true;
        body["CustomerRoles"]=[{
            "Name":"STAFF",
            Active:true
        }];
        body["GenericAttributes"]=[{
            "Key": "preferred-notifications",
            "Value": JSON.stringify({email:true,sms:true,App:true}),
            "StoreId": ""
        }, {
            "Key": "phoneNumber",
            "Value": body.username,
            "StoreId": ""
        }];
        body["AuthorizedStores"]=[{
            "StoreId":storeId === undefined?"":storeId,
            "Role":roles,
            "Active":true
        }]
        log("employee data", body);
        let createUserObject=this.customerObjectData(body)
        log("customer Object data", createUserObject);
        await awsEmailService.sendEmailNotification("templateData",body);
        let createUserInfo = await customerDao.createUser(createUserObject);
        return createUserInfo;
    }

    public customerObjectData(customerObject:any){
        if(customerObject.firstName) customerObject["FirstName"] = customerObject.firstName;
        if(customerObject.lastName) customerObject["LastName"] = customerObject.lastName;
        if(customerObject.displayName) customerObject["DisplayName"] = customerObject.displayName;
        if(customerObject.userName) customerObject["Username"] = customerObject.userName;
        if(customerObject.password) customerObject["Password"] = customerObject.password;
        if(customerObject.passwordSalt) customerObject["PasswordSalt"] = customerObject.passwordSalt;
        if(customerObject.passwordFormatId) customerObject["PasswordFormatId"] = customerObject.passwordFormatId;
        if(customerObject.email) customerObject["Email"] = customerObject.email;
        if(customerObject.AuthorizedStores) customerObject["AuthorizedStores"] = customerObject.AuthorizedStores;
        if(customerObject.Active) customerObject["Active"] = customerObject.Active;
        if(customerObject.CustomerRoles) customerObject["CustomerRoles"] = customerObject.CustomerRoles;
        if(customerObject.GenericAttributes) customerObject["GenericAttributes"] = customerObject.GenericAttributes;
        
        return customerObject;
      }

      async uploadImageUsingCustomerId(customerId:string, imageData:any, res:any) {

        let imageAllowedMimeTypes = ['image/jpeg','image/jpg', 'image/png']
        let fileType = imageAllowedMimeTypes.includes(imageData.image.mimetype)
        if(!fileType){
            return res.status(403).send({errors:['Please upload only jpeg, jpg, png images.']})
        }

        log("Get customer assets Data .");
        let userImageVerify = await customerDao.findImageByCustomerId(customerId);
        let findImage = false;
        if(userImageVerify){
        if(userImageVerify.GenericAttributes.length != 0){
                if(userImageVerify.GenericAttributes[0]["Key"] === "customerImage"){
                    let Url = userImageVerify["GenericAttributes"][0]["Value"].split('/');
                    let splitUrl = Url[Url.length - 1];
                    findImage = true;
                    log(`Delete User Image in S3 bucket.`,splitUrl);
                    await awsEmailService.deleteUserImageInS3Bucket(splitUrl);
                }
            }
        }
        log("Uploading User Image in S3 bucket.",imageData);
        let UploadedUserImageInS3Bucket = await awsEmailService.uploaduserImageInS3Bucket(
            imageData, customerId
        );
        if (UploadedUserImageInS3Bucket.statusCode === 403){
            return res.status(403).send({errors:["S3 Bucket Access Denied."]})
        }
    
        log("upload user image url",UploadedUserImageInS3Bucket);
        let insertUserImage = await customerDao.uploadUserImageRepository(customerId, UploadedUserImageInS3Bucket, findImage);
        
        if (!insertUserImage) {
            return res.status(404).send({errors:["Upload image Error"]})
        }else{
            return insertUserImage;
        }
      }
      
      async updateEmailForCustomer (customerId: string, body: any) {
        body.DisplayName = (body.DisplayName)?body.DisplayName : "";
        const Addresses = await customerDao.updateEmailForCustomer(customerId, body);
        if (Addresses) {
            const uuid = uuidv4();
            var DateTime = new Date();
            var validTo = new Date(Date.now() + 24*60*60*1000);
            let uuidData:any = uuid;
            var bodyData = {CustomerId: customerId,
                Email: body.Email,
                Token: uuidData,
                ValidFrom: DateTime,
                ValidTo: validTo,
                IsVerified: false};
            const ifEmailExistInEmailVerification = await customerDao.ifEmailExistInEmailVerification(body.Email, customerId);
            console.log(ifEmailExistInEmailVerification + "0000000000000000000000000000");
            if(ifEmailExistInEmailVerification.length) {
                const updateEmailInUserVerification = await customerDao.updateEmailInUserVerification(bodyData);
                const verify = await awsEmailServiceVerify.sendEmailNotification("templateData",body.Email, uuidData);
                return {status:200, message:{data:["User Verification updated successfully"]}};
            }
            else {
                const createUserVerificationWithEmail = await customerDao.createUserVerificationWithEmail(bodyData);
                const verify = await awsEmailServiceVerify.sendEmailNotification("templateData",body.Email, uuidData);
                return {status:201, message:{data:["User Verification created successfully"]}};
            }
        } else {
          return {status:404, message:{errors:['Update failed.']}};
        }
    }
    async createOrUpdateFeedback (customerId: string, body: any) {
        const getCustomerUsernameUsingCustomerId = await customerDao.getCustomerUsernameUsingCustomerId(customerId);
        if (!getCustomerUsernameUsingCustomerId) {
            return {status:404, message:{errors:['Customer not found']}};
        } 
                const username = getCustomerUsernameUsingCustomerId.Username;
                const ifUsernameExist = await customerDao.ifUsernameExist(username); 
                if(ifUsernameExist.length) {
                    const updateFeedBackByUsername = await customerDao.updateFeedBackByUsername(username, body);
                    return {status:200, message:{data:["Feedback updated successfully"]}};
                }
                else {
                    const createFeedBackByUsername = await customerDao.createFeedBackByUsername(username, body);
                    return {status:201, message:{data:["Feedback created successfully"]}};
                }

                
    }
    async verifyEmail(token:any) {
        let invalidResponse = "<style type='text/css'>" +
        ".container {height: 100%;}.vertical-center {margin: 0;position: absolute;padding-left: 30%;top: 50%;-ms-transform: translateY(-50%);transform: translateY(-50%);}" +
        "</style>" +
        "<div class='container'>" +
            "<div class='vertical-center'>" +
                "<h2>Token is invalid.</h2>" +
            "</div>" +
        "</div>";
        const DateTime = new Date();
        if (!token) {
                return invalidResponse;
        }
        console.log(JSON.stringify(token) + "++++++++++++++++++++++++++");
            const userVerification = await customerDao.ifTokenExist(token);
            if(userVerification) {
            if (userVerification && userVerification.ValidFrom <= DateTime && userVerification.ValidTo >= DateTime)
            {
                userVerification.IsVerified = true;
                console.log(userVerification.Token + "AAAAAAAAAAAAAAAAAAAAAAAA");
                
                let verifyEmail =  await customerDao.verifyEmail(userVerification);
       
                const response = "<style type='text/css'>" +
                ".container {height: 100%;}.vertical-center {margin: 0;position: absolute;padding-left: 30%;top: 50%;-ms-transform: translateY(-50%);transform: translateY(-50%);}" +
        "</style>" +
        "<div class='container'>" +
            "<div class='vertical-center'>" +
                "<h2>Your email has been verified successfully.</h2>" +
            "</div>" +
        "</div>";
        if(!verifyEmail){
            // return {status:403, {message:['Verification failed']});
        }
        return {status:200, message:response};
            }
            else{
                return {status:200, message:invalidResponse};
            }
            }
            else {
                return {status:200, message:invalidResponse};
            }
        }
    }



export default new CustomerService();
