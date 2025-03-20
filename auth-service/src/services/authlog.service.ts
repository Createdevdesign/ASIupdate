import CustomerDao from '../daos/customer.dao';
import { CRUD } from '@swiftserve/node-common';
import { CreateAuthClientDto } from '../dto/create.authclient.dto';
import { PutStoreDto } from '../dto/put.authclient.dto';
import { PatchStoreDto } from '../dto/patch.authclient.dto';
import authLogDao from '../daos/authlog.dao';
import customerService from '../services/customer.service';
import customerDao from '../daos/customer.dao';
import { v4 as uuid } from 'uuid';
import jwtMiddleware from "@swiftserve/node-common/dist/middleware/jwt.middleware";

const ITokenType =  {
  TEMP_STORE_TOKEN:'TEMP_STORE_TOKEN', STORE_TOKEN:'STORE_TOKEN', ANONYMOUS_CUSTOMER_TOKEN:'ANONYMOUS_CUSTOMER_TOKEN', CUSTOMER_TOKEN:'CUSTOMER_TOKEN'
}
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
        return CustomerDao.getUserById(id);
    }

      async verifyFailedAttemps(
        clientId: string,
        deviceId: string,
        PhoneNumber: string
      ){
        const authLog: any = await authLogDao.findByAuthLogUsingPhoneNumber(clientId, deviceId, PhoneNumber);
        let authLogVerify = false;
        if(authLog !== null){
          authLogVerify = true;
          if(authLog.FailedAttempts >= 5){
            authLogVerify = false;
            if(authLog.LastFailedAttemptDate !== undefined){
              if(new Date(new Date(authLog.LastFailedAttemptDate).setHours(new Date(authLog.LastFailedAttemptDate).getHours() + (24))).toISOString() >= new Date().toISOString()){
                let body:any ={}
                body.FailedAttempts=0;
                body.LastFailedAttemptDate=null;
                await authLogDao.updateFailedAttemptData(clientId, deviceId, PhoneNumber,body);
                authLogVerify = true;
              }
            }
          }
        }else{
          authLogVerify = true;
        }
        return authLogVerify;
      }

      async findByClientIdPhoneNumberDeviceId(
        clientId: string,
        body: string,
        deviceId: string,
        headers: any,
        ResponseKey: string,
        sendSms:string
      ){
        let authLogData: any = {
          Type: "SMS",
          Sub: body['phoneNumber'],
          DeviceId: deviceId,
          UserAgent: headers["user-agent"],
          ClientId: clientId,
          IPAddress:headers["host"],
          ResponseKey: ResponseKey,
          LastVerificationStatus: "Pending"
        }
        if(sendSms === "fail"){
          authLogData.Failed = 0;
        }
        const authclient: any = await authLogDao.findByAuthLogusingClientId(clientId, body['phoneNumber'], deviceId, authLogData);
    
        if (authclient) {
          console.log("Customer Authentication log updated.");
          authLogData.ModifiedDateOnUtc=new Date().toISOString();
          if(sendSms === "success"){
            authLogData.FailedAttempts=0;
          }
          if(sendSms === "fail"){
            authLogData.LastFailedAttemptDate=new Date().toISOString();
          }
          const updateClient: any = sendSms === "success"? await authLogDao.updateAuthLog(clientId, body['phoneNumber'], deviceId, authLogData):await authLogDao.updateAuthFailedLog(clientId, body['PhoneNumber'], deviceId, authLogData);
          return updateClient;
        } else {
          console.log("Customer Authentication log created.");
          if(sendSms === "success"){
            authLogData.Attempts=1;
            authLogData.FailedAttempts=0;
            authLogData.CreatedDateOnUtc=new Date().toISOString();
          }
          if(sendSms === "fail"){
            authLogData.FailedAttempts=1;
            authLogData.LastFailedAttemptDate=new Date().toISOString();
            authLogData.CreatedDateOnUtc=new Date().toISOString();
          }
          authLogData.ModifiedDateOnUtc=new Date().toISOString();
          const insertClient: any = await authLogDao.createAuthLog(authLogData);
          return insertClient;
        }
      }

      async verifyResponseKeyId(responseKey: string){
        return await authLogDao.findByAuthLogusingResponseKey(responseKey);
      }

      async findByAuthlogUsingClietId(
        body: any,
        verifyAuthLog:any,
        smsStatus
      ){
        const getAuthLog: any = await authLogDao.findByAuthLogusingClientIdAndPhoneNumber(verifyAuthLog['ClientId'], verifyAuthLog['Sub'], body["deviceId"]);
        
        let authLogData:any={};
        let isAuthLogDataVerified = false;
        console.log("Get Auth log Data.");
        if (getAuthLog) {
          console.log("Auth log updated.");
          authLogData.ModifiedDateOnUtc=new Date().toISOString();
          authLogData.ResponseKey= smsStatus === "Failed"?body.response_key:body.ResponseKey;
          authLogData.LastVerificationStatus=smsStatus;
          await authLogDao.updateAuthLogbyClientId(verifyAuthLog['ClientId'], verifyAuthLog['Sub'], body['deviceId'], authLogData);
          isAuthLogDataVerified = true;
        } 
        return isAuthLogDataVerified;
      }

      async findCustomerAfterVerify(verifyAuthLog: any, body:any) {
        const customer: any =  await CustomerDao.getUserByUsername(verifyAuthLog.Sub);
        let customerData:any=[];
        if (!customer) {
          const createCustomer = customerService.customerObject(verifyAuthLog.Sub, "CUSTOMER");
          createCustomer.ShippingAddress = {}
          const attributesData = [{
            Key: "isPhoneNumberVerified",
            Value: "true",
            StoreId: ""
          }]
          attributesData.push({
            Key: "preferred-notifications",
            Value: JSON.stringify({
              "email": true,
              "sms": true,
              "App": true
            }),
            StoreId: ""
          })
          attributesData.push({
            Key: "phoneNumber",
            Value: verifyAuthLog.Sub,
            StoreId: ""
          })
          createCustomer.GenericAttributes = attributesData
          customerData = await customerDao.createUser(createCustomer, "res");
        }else{
          await customerDao.updateCustomer(customer);
          customerData = customer;
        }
        let customerBase64Id = Buffer.from(customerData._id).toString("base64");
        let clientBase64Id = Buffer.from(verifyAuthLog.ClientId).toString("base64");
        var time = new Date();
        let customerRoles:any=[];
        customerData.CustomerRoles.filter(data => customerRoles.push(data.Name))
        const payload = {
          jti: uuid(),
          sub: customerBase64Id,
          clientId: clientBase64Id,
          DeviceId:body.deviceId,
          unique_name: customerData.Username,
          issuer: process.env.access_token_issuer,
          issued_date: time.getMilliseconds().toString(),
          expires_in: time.getMilliseconds().toString(),
          // role:customerRoles[0]===undefined?"":customerRoles[0].charAt(0).toUpperCase()
          role:"CUSTOMER"
        };
        await customerService.customerTokenInfo(
            payload,
            customerData._id,
            verifyAuthLog.ClientId,
            body.deviceId,
            body.notificationId,
            ITokenType.CUSTOMER_TOKEN,
            body.ResponseKey,
            body.userAgent,
            body.sourceIp
          );
          
        const token: string = await jwtMiddleware.createToken(payload, 1800 );
        let responseData = {
          access_token:token,
          refresh_token: body.ResponseKey,
          displayName: customerData.DisplayName === undefined || customerData.DisplayName === ""?null:customerData.DisplayName,
          customerId: customerData._id,
          email: customerData.Email === ""?null:customerData.Email
        }
        return responseData;
      }
}

export default new CustomerService();
