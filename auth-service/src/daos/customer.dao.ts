import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';
// import { CreateStoreDto } from '../dto/create.store.dto';
// import { PatchStoreDto } from '../dto/patch.store.dto';
// import { PutStoreDto } from '../dto/put.store.dto';

const log: debug.IDebugger = debug('app:authclient-dao');

class CustomerDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;

    AuthorizedStoreSchema = new this.Schema({
        StoreId: {
          type: String,
        },
        Role: {
          type: [String],
        },
        Active: {
          type: Boolean,
        },
      });
      
      CustomerRoleSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        Name: {
          type: String,
        },
        Active: {
          type: Boolean,
        },
      });
      
      GenericAttributesSchema = new this.Schema({
        _id: false,
        Key: {
          type: String,
        },
        Value: {
          type: String,
        },
        StoreId: {
          type: String,
        }
      });
      
    customerSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        GenericAttributes:{
            type: [this.GenericAttributesSchema]
        },
        DisplayName:{
            type: String,
        },
        FirstName: {
            type: String,
        },
        LastName: {
            type: String,
        },
        Username: {
            type: String,
        },
        Password: {
            type: String,
        },
        Email: {
            type: String,
        },
        CustomerRoles:{
            type: [this.CustomerRoleSchema]
        },
        AuthorizedStores: {
            type: [this.AuthorizedStoreSchema],
        },
        Active: {
            type: Boolean,
        },
        PasswordFormatId: {
            type: Number,
        },
        PasswordSalt: {
            type: String,
        },
        AdminComment: {
            type: String,
        },
        IsTaxExempt: {
            type: Boolean,
        },
        FreeShipping: {
            type: Boolean,
        },
        AffiliateId: {
            type: String,
        },
        VendorId: {
            type: String,
        },
        StoreId: {
            type: String,
        },
        StaffStoreId: {
            type: String,
        },
        OwnerId: {
            type: String,
        },
        Deleted: {
            type: Boolean,
        },
        IsSystemAccount: {
            type: Boolean,
        },
        HasContributions: {
            type: Boolean,
        },
        FailedLoginAttempts: {
            type: String,
        },
        CannotLoginUntilDateUtc: {
            type: String,
        },
        SystemName: {
            type: String,
        },
        LastIpAddress: {
            type: String,
        },
        CreatedOnUtc: {
            type: String,
        },
        UrlReferrer: {
            type: String,
        },
        LastLoginDateUtc: {
            type: String,
        },
        LastActivityDateUtc: {
            type: String,
        },
        LastPurchaseDateUtc: {
            type: String,
        },
        LastUpdateCartDateUtc: {
            type: String,
        },
        LastUpdateWishListDateUtc: {
            type: String,
        },
        PasswordChangeDateUtc: {
            type: Date,
        },
        ShoppingCartItems: {
            type: Array,
        },
        BillingAddress: {
            type: String,
        },
        ShippingAddress: {
            type: Object,
        },
        Addresses: {
            type: [],
        },
        CustomerTags: {
            type: [],
        },
        Preference: {
            type: String,
        },
        Sessions: []
    });

    Customer = mongooseService.getMongoose().model('Customer', this.customerSchema, 'Customer');
    
    constructor() {
        log('Created new instance of StoreDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async getUserByUsername(username: string) {
        return this.Customer.findOne({ Username: username }).exec();
    }
    async getUserById(Id: string) {
        return this.Customer.findOne({ _id: Id }).exec();
    }
    async findByEmailId(emailId:string) {
        const customer: any = await this.Customer.findOne({Email:emailId}).exec();
        return customer;
      }
    async createUser(session: any, res:any) {
        log("Saving Customer.");
        const customer: any = await this.Customer.create(session);
        return customer;
    }

    async updateCustomer(customer: any) {
        log("Update customer");
        const updateCustomerData:any={};
        const customerRole:any={};
        customerRole.Name= "CUSTOMER";
        customerRole.Active= true;
        updateCustomerData.CustomerRoles=[customerRole];
        let update:any = {
          $set: updateCustomerData
        }
        let customerDataPhoneNumber = customer.GenericAttributes.filter(item=> item.Key === 'phoneNumber')
        let customerDataPreferredNotifications = customer.GenericAttributes.filter(item=> item.Key === 'preferred-notifications')
        if(customerDataPhoneNumber.length === 0 || customerDataPreferredNotifications.length === 0){
            let pushData:any = []
            if(customerDataPreferredNotifications.length === 0){
              pushData.push({
                "Key": "preferred-notifications",
                Value: JSON.stringify({
                  "email": true,
                  "sms": true,
                  "App": true
                }),
                StoreId: ""
              })
            }
            if(customerDataPhoneNumber.length === 0){
              pushData.push({
                Key: "phoneNumber",
                Value: customer.Username,
                StoreId: ""
              })
            }
            
            update = {
              $set: updateCustomerData,
              $push: { GenericAttributes: { $each: pushData}}
            }
          }  
        
        const getCustomer: any =  await this.Customer.findOneAndUpdate({_id: customer["_id"]}, update,{new: true}).exec();
        return getCustomer;
    }

    async updatePassWord(customerId: string,password:string,PasswordSalt:string,PasswordFormatId:number) {
        log("changed new password");
        const customer: any =  await this.Customer.findOneAndUpdate({_id: customerId}, { $set: {Password:password,PasswordSalt:PasswordSalt,PasswordFormatId:PasswordFormatId} },{new: true}).exec();
        return customer;
      }

    async sendEmailCreateHaskKeyInCustomer(customer: any,updateCustomerData:any) {
        log("changed new password");
        return await this.Customer.findOneAndUpdate({_id: customer["_id"]}, {
            $push: { GenericAttributes: updateCustomerData},
            $set: {"PasswordChangeDateUtc":new Date().toISOString()}
          },{new: true}).exec();
    }
    async sendEmailUpdateHaskKeyInCustomer(customer: any, data:any) {
        log("changed new password");
        return await this.Customer.updateOne(
            { _id: customer["_id"], "GenericAttributes": { $elemMatch: { "Key": "hashKey"}} },
            { "$set": {"GenericAttributes.$.Value": data, "PasswordChangeDateUtc":new Date().toISOString()}}
          )
          .exec();
    }
    async findByUsernameusingHashKey(body: any) {
        log("Fetching Customer by Username.");
        const customer: any = await this.Customer.findOne({ Username: body["userName"], GenericAttributes:{$elemMatch:{"Key":"hashKey",Value:body["hashKey"]}} }).exec();
        return customer;
    }
}

export default new CustomerDao();
