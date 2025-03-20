import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';
import moment from 'moment';

const log: debug.IDebugger = debug('app:customer-dao');

class CustomerLogDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;
    AddressSchema = new this.Schema({
      _id: { type: String, default: this.Types.ObjectId },
      FirstName: { type: String },
      LastName: { type: String },
      Email: { type: String },
      Company: { type: String },
      CountryId: { type: String },
      StateProvinceId: { type: String },
      City: { type: String },
      Address1: { type: String },
      Address2: { type: String },
      ZipPostalCode: { type: String },
      PhoneNumber: { type: String },
      FaxNumber: { type: String },
      Verified: { type: Boolean },
      Coordinates: { lat: String, lon: String },
      Default: { type: Boolean, default: false},
      createdDate: { type: Date, default: moment().utc() },
    });    
    GenericAttributesSchema = new this.Schema({
      _id : false,
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
    
    ShoppingCartItemsSchema = new this.Schema({
      _id: { type: String, default: this.Types.ObjectId },
      GenericAttributes: {
        type: [],
      },
      StoreId: {
        type: String,
      },
      WarehouseId: {
        type: Number,
      },
      ShoppingCartTypeId: {
        type: Number,
      },
      ProductId: {
        type: String,
      },
      AttributesXml: {
        type: String,
      },
      CustomerEnteredPrice: {
        type: String,
      },
      Quantity: {
        type: String,
      },
      RentalStartDateUtc: {
        type: Date,
      },
      RentalEndDateUtc: {
        type: Date,
      },
      CreatedOnUtc: {
        type: Date,
      },
      UpdatedOnUtc: {
        type: Date,
      },
      ShoppingCartType: {
        type: Number,
      },
      IsFreeShipping: {
        type: Boolean,
      },
      IsGiftCard: {
        type: Boolean,
      },
      IsShipEnabled: {
        type: Boolean,
      },
      AdditionalShippingChargeProduct: {
        type: String,
      },
      IsTaxExempt: {
        type: Boolean,
      },
      IsRecurring: {
        type: Boolean,
      },
      ReservationId: {
        type: Number,
      },
      Parameter: {
        type: Number,
      },
      Duration: {
        type: String,
      },
      AdditionalComments: {
        type: String,
      },
      OrderType: {
        type: Number,
      },
      DeliveryTime: {
        type: String,
      },
    });
    
    CustomerSchema = new this.Schema({
      _id: { type: String },
      GenericAttributes: {
        type: [this.GenericAttributesSchema],
      },  
      Addresses: {
        type: [this.AddressSchema],
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
      Email: {
        type: String,
      },
      DisplayName:{
        type: String,
      },
      Active: {
        type: Boolean,
      },
      ShoppingCartItems:{
        type:[this.ShoppingCartItemsSchema]    
      }
    });

    QiCodeSchema = new this.Schema({
      _id: { type: String },
      GenericAttributes: {
        type: [this.GenericAttributesSchema],
      },  
      ExtId: {
        type: String,
      },
      StoreId: {
        type: String,
      },
      Type: {
        type: String,
      },
      Metadata: {
        type: Number,
      },
      CreatedDt: {
        type: Date, default: moment().utc(),
      },
      CreatedBy:{
        type: String,
      },
    });
    
    Customer = mongooseService.getMongoose().model('Customer', this.CustomerSchema, 'Customer');
    QiCodes = mongooseService.getMongoose().model('QiCodes', this.QiCodeSchema, 'QiCodes');
    constructor() {
        log('Created new instance of AuthLogDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async findStoresByCustomerId(
      customerId: string
    ) {
      log("Fetching stores by customer Id.");
      const stores:any = await this.Customer.aggregate([
        { $match: { _id: customerId, "AuthorizedStores.Active":true } },
        {
          $lookup: {
            from: 'Store', localField: 'AuthorizedStores.StoreId',
            foreignField: '_id', as: 'Stores'
          }
        },
        {$unwind : { path: "$Stores", preserveNullAndEmptyArrays: true }},
        {
          $project: {
            _id:0,
            storeId:"$Stores._id",
            storeName: "$Stores.Name",
            storeAddress: "$Stores.Address",
            storeThumbnail: this.aggregationConditionStringObject("$Stores.Configuration.Assets","$Stores.Configuration.Assets.Thumbnail","" ),
            storeLogo: this.aggregationConditionStringObject("$Stores.Configuration.Assets","$Stores.Configuration.Assets.Logo","" ),
            storeImage: this.aggregationConditionStringObject("$Stores.Configuration.Assets","$Stores.Configuration.Assets.Image","" )
          }
        },
      ]).exec();
      return stores;
    }

    public aggregationConditionStringObject(value: any, elseData:any, thenData:any) {
      let conditionData = {
        $cond: {
          if: { $eq: [ {$ifNull:[value, undefined]}, null] },
           then: thenData,
           else: elseData
        }
      }
      return conditionData;
    }

    public async findAddressByAddressId(
      addressId: string,
      storeAddress:any
    ) {
      log("Fetching address by customer Id and address id.");
      const customer: any = await this.Customer
        .findOne(
          { "Addresses._id": addressId },
          { "Addresses.$": 1 }
        )
        .exec();
      let addressData = customer?customer['Addresses'][0]:null;
      return addressData;
    }

    async findCustomerUsingCustomerId(customerId:string, queryData: any){
      log("find customer using customerId.");
      let paginationData:any =  []
      let Page = 1;
      if(queryData.page && queryData.limit){
        Page = parseInt(queryData.page);
        const Limit = parseInt(queryData.limit);
        var Offset: number = (Page - 1) * Limit;
        paginationData =  [ { $skip: Offset }, { $limit: Limit } ]
      }
      const customerInfo: any = await this.Customer.aggregate([
        { $match: { _id: customerId } },
        { $unwind: { path: "$ShoppingCartItems", preserveNullAndEmptyArrays: true } },
        {$group: {_id: '$ShoppingCartItems.StoreId',date: {$max: '$ShoppingCartItems.UpdatedOnUtc'}}},
        { $sort:{"date":-1} },
        {
          $lookup: {
            from: 'Store', 
            let: { "keywordId": "$_id", "updateUtc": "$date"},
            pipeline: [
              // { $match: { $expr:{ $eq: ["$_id", "$$keywordId"] }}},
              { $match: { $expr:{ 
                $and: [
                    { $eq: ['$_id', '$$keywordId'] },
                    { $eq: ['$Configuration.Active', true] },
                  ]
                
              }}},
              {
                $project: {
                  "Name": 1,
                  "Address": 1,
                  "CompanyHours":1,
                  ThumbnailImage: this.aggregationConditionStringObject("$Configuration.Assets","$Configuration.Assets.Thumbnail","" ),
                  Logo: this.aggregationConditionStringObject("$Configuration.Assets","$Configuration.Assets.Logo","" ),
                  Image: this.aggregationConditionStringObject("$Configuration.Assets","$Configuration.Assets.Image","" ),
                }
              },
            ],
            as:"StoreData"
          }
        },
        {
        $addFields: {
          "Stores": {
            $cond: {
                if: { $eq: [ {$ifNull:["$StoreData", null]}, null] },
                then: "",
                else: {$arrayElemAt: ["$StoreData", 0]}
            }
          }
        }
        },
        {
          $project: {
            Store: "$Stores",
            // _id: "$date",
            _id:0
          }
        },
        
      ])
      .facet({
        total: [{ $count: 'total' }],
        data: paginationData // add projection here wish you re-shape the docs
      })
      .addFields({
      "total": {
        "$ifNull": [{ "$arrayElemAt": [ "$total.total", 0 ] }, 0]
      },
      "page": Page
      })
      .exec();
      // for dublicate key skip code 
      // if(customerInfo[0]["data"][0]['Store'] !== undefined){
      //   const result = [];
      //   const map = new Map();
      //   for (const item of customerInfo[0]["data"]) {
      //     if(!map.has(item.Store._id)){
      //         map.set(item.Store._id, true);    // set any value to Map
      //         result.push(item);
      //     }
      //   }
      //   // customerInfo[0]["total"] = result.length;
      //   customerInfo[0]["data"] = result;
      // }
      
      if(customerInfo[0]["data"]["length"] !== 0){
        if(customerInfo[0]["data"][0]['Store'] === undefined){
          customerInfo[0]["total"] = 0
          customerInfo[0]["data"] = []
        }
      }
      
      return customerInfo?customerInfo[0]:null;
    }
    async checkIfCustomerExist(
      customerId: string
    ) {
      log("Creating Store.");
      const doc: any = await this.Customer.find({_id: customerId}, {Username: 1}).exec();
     return doc;
    }

    async checkIfQrCodeExist(
      extId: string
    ) {
      log("Creating Store.");
      const doc: any = await this.QiCodes.find({ExtId: extId}).exec();
     return doc;
    }
}

export default new CustomerLogDao();
