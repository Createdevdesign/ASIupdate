import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';
import moment from 'moment';

const log: debug.IDebugger = debug('app:customer-dao');

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
    feedbackSchema = new this.Schema({
      _id: { type: String, default: this.Types.ObjectId },
      GenericAttributes: {
        type: [],
      },
      Username: {
        type: String,
      },
      Text: {
        type: String,
      },
      CreateDate: {
         type: Date, default: moment().utc() 
        },
    });
    userEmailVerificationSchema = new this.Schema({
      _id: { type: String, default: this.Types.ObjectId },
      GenericAttributes: {
        type: [],
      },
      CustomerId: {
        type: String,
      },
      Token: {
        type: String,
      },
      Email: {
        type: String,
      },
      ValidFrom: {
         type: Date, default: moment().utc() 
        },
      ValidTo: {
      type: Date, default: moment().utc() 
      },
      IsVerified: {
        type: Boolean,
    },
    });

    Customer = mongooseService.getMongoose().model('Customer', this.customerSchema, 'Customer');
    Feedback = mongooseService.getMongoose().model('Feedback', this.feedbackSchema, 'Feedback');
    UserEmailVerification = mongooseService.getMongoose().model('UserEmailVerification', this.userEmailVerificationSchema, 'UserEmailVerification');
    constructor() {
        log('Created new instance of StoreDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async findCustomerUsingCustomerId(customerId: string, queryData:any) {
        log("find customer using customerId.");
        let query:any = { _id: customerId };
        if(queryData.phoneNumber){
            query = { Username: { $regex: queryData.phoneNumber} }
        }
        const customerInfo: any =  await this.Customer.aggregate([
            { $match: query },
            {
              $lookup: {
                from: 'UserEmailVerification', 
                let: { "keywordId": "$_id", "keywordId2": "$Email" },
                pipeline: [
                  { $match: { $expr: {
                    $and: [
                      { $eq: ["$CustomerId", "$$keywordId"] },
                      { $eq: [ "$Email","$$keywordId2"] }
                    ]} 
                  }},
                  { $sort : {"ValidFrom":-1}},
                  {
                    $project: {
                      "_id": 1,
                      "CustomerId": 1,
                      "IsVerified": 1
                    }
                  },
                ],
                as:"IsEmailVerification"
              }
            },
            {
              $addFields: {
                "FirstName": this.aggregationConditionString("$FirstName", ""),
                "LastName": this.aggregationConditionString("$LastName", ""),
                "DisplayName":this.aggregationConditionString("$DisplayName", ""), 
                "Email": this.aggregationConditionString("$Email", ""),
                "Phone#": this.aggregationConditionString("$Phone#", ""),
                "IsEmailVerified": this.aggregationConditionArrayString("$IsEmailVerification.IsVerified", false, "$IsEmailVerification.IsVerified"),
                "GenericAttributes": {
                  "$filter": {
                    "input": "$GenericAttributes",
                    "as": "el",
                    "cond": { "$eq": ["$$el.Key", "customerImage"]}
                  }
                },
                "StripeId": {
                    "$filter": {
                    "input": "$GenericAttributes",
                    "as": "el",
                    "cond": { "$eq": ["$$el.Key", "StripeId"]}
                    }
                }
              }
            },
            {
              $project: {
                _id: 1,
                FirstName: 1,
                LastName: 1,
                Username:1,
                DisplayName: 1,
                Email: 1,
                "Phone#":1,
                IsEmailVerified:1,
                ProfileImage: this.aggregationConditionArrayString("$GenericAttributes.Key", "","$GenericAttributes.Value"),
                CustomerSID: this.aggregationConditionArrayString("$StripeId.Key", "","$StripeId.Value")
              }
            },
          ]).exec();
        return customerInfo[0];
    }

    public aggregationConditionString(value: any, thenData:any) {
        let conditionData = {
          $cond: {
            if: { $eq: [ {$ifNull:[value, undefined]}, null] },
             then: thenData,
             else: value
          }
        }
        return conditionData;
    }
    public aggregationConditionArrayString(value: any, thenData:any, elseValue:any) {
        let conditionData = {
            $cond: {
            if: { $eq: [ {$ifNull:[{ $arrayElemAt: [value, 0] }, undefined]}, null] },
            then: thenData,
            else: { $arrayElemAt: [elseValue, 0] }
            }
        }
        return conditionData;
    }

    async findPreferenceNotificationUsingCustomerId(customerId: string) {
      log("find customer using customerId.");
      let query:any = { _id: customerId };
      const customerInfo: any =  await this.Customer.aggregate([
          { $match: query },
          {
            $project: {
              _id: 1,
              GenericAttributes: 1,
            }
          }
        ]).exec();
      return customerInfo[0];
  }

  async updateUserPreferenceByCustomerId(
    customerId: string,
    body: any
  ) {
    log("Updating  User preferences.");
    const doc: any = await this.Customer.findOneAndUpdate(
      {'_id':customerId},
      { $set: {"GenericAttributes.$[elem]":body}},
      {
        arrayFilters: [{ "elem.Key": "preferred-notifications" }],
        new: true,
      }
    ).exec();
   return doc;
  }
  async updateUserByCustomerIdAndBody(
    customerId: string,
    body: any
  ) {
    log("Updating  User preferences.");
    const doc: any = await this.Customer.findOneAndUpdate({'_id':customerId},{$set:body}).exec();
   return doc;
  }

  async createUser(
    body: any
  ){
    log("Create User data.");
    const createUser: any = this.Customer.create(body);
    return createUser;
  }

  async findImageByCustomerId(
    customerId: string
  ) {
    log("Fetching picture by customer Id.", customerId);
    const user: any = await this.Customer.aggregate(
      [
        { $match: {_id: customerId} },
        {
          $project: {
            GenericAttributes: {
              $filter: {
                input: "$GenericAttributes",
                as: "customerImageKey",
                cond: {
                  // $in: ["$$productPictures.PictureId", ["e509bdee-228a-4cf7-b42e-0782b50a8d30", "0509e4cf-5b55-4cf1-856f-9c947a794f7b"]],
                  $in: ["$$customerImageKey.Key", ["customerImage"]],
                },
              },
            },
          },
        },
      ]).exec();
    return user?user[0]:null;
  }

  async uploadUserImageRepository(
    customerId: string,
    s3Data:any,
    findImage: boolean
  ){
    log("S3 bucket Data.",s3Data);
    
    if(findImage == true){
      let data = await this.Customer.findOneAndUpdate(
        { _id: customerId },
        { $set: { "GenericAttributes.$[elem]": {Key:"customerImage", Value:s3Data.Location, StoreId:""} } },
        {
          arrayFilters: [{ "elem.Key": "customerImage" }],
          new: true,
        }
      ).exec();
      log("Updating image in generic attributes.",data);
    }else{
      await this.Customer
      .findOneAndUpdate(
        { _id: customerId },
        { $push: { GenericAttributes: {Key:"customerImage", Value:s3Data.Location, StoreId:""} } },
      )
      .exec();
    }
    return s3Data;
  }
  async updateEmailForCustomer(
    customerId: string,
    body: any
  ) {
    // logger.debug("Updating address data", addressFinalData);
    const updateEmailForCustomer = await this.Customer
      .updateOne(
        { _id: customerId },
        { "$set": {Email: body.Email, DisplayName: body.DisplayName}}
      )
      .exec();
    return updateEmailForCustomer;
   
  }

  async getCustomerUsernameUsingCustomerId(
    customerId: string,
  ) {
    // logger.debug("Updating address data", addressFinalData);
    const getCustomerUsernameUsingCustomerId = await this.Customer
    .findById({ _id: customerId }, { Username: 1 })
      .exec();
    return getCustomerUsernameUsingCustomerId;
   
  }
  async ifUsernameExist(
    username: string,
  ) {
    // logger.debug("Updating address data", addressFinalData);
    const ifUsernameExist = await this.Feedback
    .find({ Username: username})
      .exec();
    return ifUsernameExist;
   
  }

  async updateFeedBackByUsername(
    username: string,
    body: any
  ) {
    // logger.debug("Updating address data", addressFinalData);
    const updateFeedBackByUsername = await this.Feedback
      .updateOne(
        { Username: username },
        { "$set": {Text: body.Feedback}}
      )
      .exec();
    return updateFeedBackByUsername;
   
  }
  async createFeedBackByUsername(username:string, body: any) {
    const query = {
      Username: username,
      Text: body.Feedback
    }
    const createFeedBackByUsername = await this.Feedback.create(query);
    return createFeedBackByUsername;
}

async ifEmailExistInEmailVerification(
  email: string, customerId: string
) {
  // logger.debug("Updating address data", addressFinalData);
  const ifEmailExistInEmailVerification = await this.UserEmailVerification
  .find({ Email: email, CustomerId: customerId})
    .exec();
  return ifEmailExistInEmailVerification;
 
}

async updateEmailInUserVerification(
  body: any
) {
  console.log(body)
  // logger.debug("Updating address data", addressFinalData);
  const updateEmailInUserVerification = await this.UserEmailVerification
    .updateOne(
      { Email: body.Email },
      { "$set": body}
    )
    .exec();
  return updateEmailInUserVerification;
 
}
async createUserVerificationWithEmail(body: any) {
  const createUserVerificationWithEmail = await this.UserEmailVerification.create(body);
  return createUserVerificationWithEmail;
}
async ifTokenExist(
  token: string
) {
  // logger.debug("Updating address data", addressFinalData);
  const ifTokenExist = await this.UserEmailVerification
  .find({ Token: token})
    .exec();
    let ifTokenExistFinalData:any = ifTokenExist.length === 0?null:ifTokenExist[0]
    console.log(ifTokenExist + "BBBBBBBBBBBBBBBBBBBBBBBB");
  return ifTokenExistFinalData;
 
}
async verifyEmail(
  body: any
) {
  console.log(body)
  // logger.debug("Updating address data", addressFinalData);
  const updateEmailInUserVerification = await this.UserEmailVerification
    .updateOne(
      { Token: body.Token },
      { "$set": body}
    )
    .exec();
  return updateEmailInUserVerification;
 
}
}

export default new CustomerDao();
