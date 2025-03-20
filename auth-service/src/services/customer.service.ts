import CustomerDao from '../daos/customer.dao';
import { CRUD } from '@swiftserve/node-common';
import { CreateAuthClientDto } from '../dto/create.authclient.dto';
import { PutStoreDto } from '../dto/put.authclient.dto';
import { PatchStoreDto } from '../dto/patch.authclient.dto';
import * as bcrypt from "bcryptjs";
import CustomerSessionDao from '../daos/customerSession.dao';
import { v4 as uuid } from 'uuid';
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
        return CustomerDao.getUserById(id);
    }
    async findCustomerUsingId(username: string) {
        return CustomerDao.getUserByUsername(username);
    }
    async findCustomerUsingEmail(email: string) {
      return CustomerDao.findByEmailId(email);
  }
    async checkUserAccess(customer: any) {
        return (
            customer?.AuthorizedStores &&
            customer?.AuthorizedStores.filter((store: any) => store.Active).length > 0
        );
    }

    
    async storeTokenInfo(
        payload: any,
        customerId: string,
        clientId: string,
        headers: any,
        notificationId: string,
        tokenType: any,
        refreshTokenId: string,
        cleintData: any
    ) {
        await CustomerSessionDao.deleteUserSessions(
          customerId,
          headers["x-device-id"]
        );
        const customerSession: any = {};
        customerSession.CustomerId = customerId;
        customerSession.DeviceId = headers["x-device-id"];
        customerSession.type = tokenType,
        customerSession.UserAgent = headers["user-agent"];
        customerSession.ClientId = clientId;
        customerSession.AccessToken = {
            JTI: payload.jti,
            IssueDate: new Date().toISOString(),
            Expiry: cleintData.TempTokenValidity === undefined ? "1800" : (tokenType === 'STORE_TOKEN' ? cleintData.TokenValidity : cleintData.TempTokenValidity)
        };
        customerSession.NotificationId = notificationId;
        customerSession.RecentIPAddress = headers["host"];
        if (tokenType == 'STORE_TOKEN') {
            customerSession.RefreshToken = {
                TokenId: refreshTokenId,
                IssueDate: new Date().toISOString(),
                Expiry: cleintData.RefreshTokenValidity === undefined ? "365D" : cleintData.RefreshTokenValidity
            };
        }
        await CustomerSessionDao.save(customerSession);
    }

    async verifyPassword(passwordIn: string, dbPassword: string) {
        const valid: boolean = bcrypt.compareSync(passwordIn, dbPassword);
        return valid;
    }

    async verifyDeviceId(CustomerId: string, deviceId: string) {
        const valid: boolean = await CustomerSessionDao.findByDeviceId(CustomerId,deviceId);
        return valid;
    }

    async invalidateByIdAndDeviceIdAndAccessJti(customerId: string, deviceId: string){
        const customerSession: any= await CustomerSessionDao.deleteDeviceIdAndID(customerId,deviceId);
        return customerSession?1:0;
    }

    async checkUserAccessStoreId(customer: any,storeId: string) {
        var jsonStores = customer.AuthorizedStores;
        var checkStore:boolean = false
        var i:number;
        for (i=0; i < jsonStores.length; i++) {
          if (jsonStores[i].StoreId == storeId ){
            checkStore = true;
          }
        }
        return checkStore;
    }

    async verifyUser(customer: any,storeId: string) {
        let AuthorizedStores:any=customer.AuthorizedStores;
        
        const store: any = AuthorizedStores.filter(store=> store.StoreId == storeId);
        let check:boolean=false;
        if(store && store.length > 0){
          let Role: Boolean = store[0].Role.includes('ADMIN') || store[0].Role.includes('MANAGER')
          if(Role && customer.Active){
            check=true;
          }
        }
        return check;
      }

      async userRoles(stores: any,storeId: string) {
        const store: any = stores.filter(store=> store.StoreId == storeId);
        
        if(store && store.length > 0)
            return store[0].Role;
        else {
            return "false";
        }
      }

      async verifyRefreshTokenId(CustomerId: string, tokenId: string, tokentType:string){
        const customerSession: any =  await CustomerSessionDao.findByRefreshTokenId(CustomerId,tokenId,tokentType);
        if (!customerSession.length) {
          return false;
        }else{
          var myDate = new Date(customerSession[0]['RefreshToken']['IssueDate']);
          myDate.setFullYear(myDate.getFullYear() + 1);
          // myDate.setMinutes(myDate.getMinutes() + 45);
          console.log(myDate.toISOString())
          console.log(new Date().toISOString())
          if(new Date().toISOString() <= myDate.toISOString()){
            return true
          }{
            return "refresh_token_expired";
          }
        }
        
      }

      async storeRefreshTokenInfo(
        payload: any,
        customerId: string,
        clientId: string,
        headers: any,
        cleintData: any
    ) {
        const customerSession: any = {};
        customerSession.AccessToken = {
            JTI: payload.jti,
            IssueDate: new Date().toISOString(),
            Expiry: cleintData.RefreshTokenValidity === undefined? "365D":cleintData.RefreshTokenValidity,
        };
        customerSession.UserAgent = headers["user-agent"];
        customerSession.RecentIPAddress = headers["host"];
        customerSession.LastIssuedDateTime =new Date().toISOString()
        await CustomerSessionDao.updateUserSessions(customerId,headers["x-device-id"],clientId,customerSession);
    }

    customerObject(deviceId: string, role: string): any {
        const createCustomer:any={};
          const customerRole:any={};
          customerRole.Name= role;
          customerRole.Active= true;
          createCustomer.Username = deviceId;
          createCustomer.Email = "";
          createCustomer.Password= null;
          createCustomer.DisplayName="";
          createCustomer.PasswordFormatId= 0;
          createCustomer.PasswordSalt = null;
          createCustomer.Active= true;
          createCustomer.AdminComment=null;
          createCustomer.IsTaxExempt=false;
          createCustomer.FreeShipping=false;
          createCustomer.AffiliateId=null;
          createCustomer.VendorId=null;
          createCustomer.StoreId=null;
          createCustomer.StaffStoreId=null;
          createCustomer.OwnerId=null;
          createCustomer.Deleted=false;
          createCustomer.IsSystemAccount=false;
          createCustomer.HasContributions=false;
          createCustomer.FailedLoginAttempts=0;
          createCustomer.CannotLoginUntilDateUtc=null;
          createCustomer.SystemName=null;
          createCustomer.LastIpAddress=null
          createCustomer.CreatedOnUtc= new Date().toISOString();
          createCustomer.UrlReferrer=null;
          createCustomer.LastLoginDateUtc=null;
          createCustomer.LastActivityDateUtc= new Date().toISOString();
          createCustomer.LastPurchaseDateUtc=null;
          createCustomer.LastUpdateCartDateUtc=null;
          createCustomer.LastUpdateWishListDateUtc=null;
          createCustomer.PasswordChangeDateUtc=null;
          createCustomer.CustomerRoles=[customerRole];
          createCustomer.BillingAddress=null;
          createCustomer.Preference=null;
          
        return createCustomer;
      }

    async createCustomer(createCustomer:any, res:any){
        const customerData = await CustomerDao.createUser(createCustomer, res);
        return customerData;
      }

      async storeCustomerSessionData(customer: any, deviceId: string, uuidData: string, headers:any, clientId:string, tokenType:string ) {
        await CustomerSessionDao.deleteUserSessions(
            customer._id,
            deviceId
          );
        
        let customerRoles:any=[];
        customer.CustomerRoles.filter(data =>customerRoles.push(data.Name));
        let customerBase64Id = Buffer.from(customer._id).toString("base64");
        let clientIdBase4Id = Buffer.from(clientId).toString("base64");
        var time = new Date();
        const payload = {
          jti: uuidData,
          sub: customerBase64Id,
          clientId:clientIdBase4Id,
          issued_date: time.getMilliseconds().toString(),
          expires_in: time.getMilliseconds().toString(),
          DeviceId:deviceId,
          issuer: process.env.access_token_issuer,
          role: customerRoles,
          unique_name: customer.Username
        };
        
        const customerSession:any={};
        customerSession.CustomerId = customer._id;
        customerSession.DeviceId = deviceId;
        customerSession.type =tokenType,
        customerSession.UserAgent = headers["user-agent"];
        customerSession.ClientId = clientId;
        customerSession.AccessToken = {
          JTI: uuidData,
          IssueDate:new Date().toISOString(),
          Expiry: "1800"
        };
        customerSession.NotificationId = "";
        customerSession.RecentIPAddress = headers["host"];
        // if(tokenType=='STORE_TOKEN'){
        customerSession.RefreshToken = {
          TokenId: uuidData,
          IssueDate:new Date().toISOString(),
          Expiry: "365D"
        };
        // }
        await CustomerSessionDao.save(customerSession);
        return payload;
      }

      async verifyAnonymousUser(customer: any) {
        let AuthorizedStores:any=customer.CustomerRoles;
        
        const store: any = AuthorizedStores.filter(role=> role.Name == "ANONYMOUS");
    
        let check:boolean=false;
        if(store && store.length > 0){
          let Role: Boolean = store[0].Name.includes('ANONYMOUS')
          if(Role && customer.Active){
            check=true;
          }
        }
        return check;
      }

      async customerTokenInfo(
        payload: any,
        customerId: string,
        clientId: string,
        deviceId: any,
        notificationId: string,
        tokenType: any,
        refreshTokenId: string,
        userAgent:string,
        sourceIp: string
    ) {
        await CustomerSessionDao.deleteUserSessions(
          customerId,deviceId
        );
        const customerSession: any = {};
        customerSession.CustomerId = customerId;
        customerSession.DeviceId = deviceId;
        customerSession.type = tokenType,
        customerSession.UserAgent = userAgent;
        customerSession.ClientId = clientId;
        customerSession.AccessToken = {
            JTI: payload.jti,
            IssueDate: new Date().toISOString(),
            Expiry: "1800"
        };
        customerSession.NotificationId = notificationId;
        customerSession.RecentIPAddress = sourceIp;
        customerSession.RefreshToken = {
            TokenId: refreshTokenId,
            IssueDate: new Date().toISOString(),
            Expiry: "365D"
        };
        await CustomerSessionDao.save(customerSession);
    }

    async changePasswordUsingCustomerId(
      customerId: string,
      password: string,
      PasswordSalt: string,
      PasswordFormatId: number
  ) {
    return await CustomerDao.updatePassWord(
      customerId,
      password,
      PasswordSalt,
      PasswordFormatId
    );
  }

  async sendEmailHaskKeyInCustomer(customer: any, httpType:string) {
    let data:any = uuid();
    const updateCustomerData:any={
      Key: "hashKey",
      Value: data,
      StoreId: ""
    };
    const getCustomer: any =  httpType === "create"?await CustomerDao.sendEmailCreateHaskKeyInCustomer(customer,updateCustomerData): await CustomerDao.sendEmailUpdateHaskKeyInCustomer(customer, data);
    if(getCustomer){
      return data;
    }else{
      return null;  
    }
  }

  async findUserUsingHashKey(body: any) {
    return await CustomerDao.findByUsernameusingHashKey(body);
  }

  async gmailStoreTokenInfo(
    payload: any,
    customerId: string,
    clientId: string,
    headers: any,
    notificationId: string,
    tokenType: any,
    refreshTokenId: string,
    cleintData: any,
    authType: string
) {
    await CustomerSessionDao.deleteUserSessions(
      customerId,
      headers["x-device-id"]
    );
    const customerSession: any = {};
    customerSession.CustomerId = customerId;
    customerSession.DeviceId = headers["x-device-id"];
    customerSession.type = tokenType,
    customerSession.UserAgent = headers["user-agent"];
    customerSession.ClientId = clientId;
    customerSession.AccessToken = {
        JTI: payload.jti,
        IssueDate: new Date().toISOString(),
        Expiry: cleintData.TempTokenValidity === undefined ? "1800" : (tokenType === 'STORE_TOKEN' ? cleintData.TokenValidity : cleintData.TempTokenValidity)
    };
    customerSession.NotificationId = notificationId;
    customerSession.RecentIPAddress = headers["host"];
    customerSession.loginMethod = authType;

    if (tokenType == 'STORE_TOKEN') {
        customerSession.RefreshToken = {
            TokenId: refreshTokenId,
            IssueDate: new Date().toISOString(),
            Expiry: cleintData.RefreshTokenValidity === undefined ? "365D" : cleintData.RefreshTokenValidity
        };
    }
    await CustomerSessionDao.save(customerSession);
  }

  async getUserById(
    customerId: string
) {
    return    await CustomerDao.getUserById(customerId);
  }
}

export default new CustomerService();
