import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';
import { v4 as uuid } from "uuid";

const log: debug.IDebugger = debug('app:customer-dao');

class CustomerDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;
    cartItemId = this.Types.ObjectId;
    
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
            type:[this.ShoppingCartItemsSchema]
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

    async findCustomerUsingCustomerId(customerId:string, storeId, queryData: any) {
      log("find customer using customerId.", queryData);
      const customerInfo: any = await this.Customer.aggregate([
        { $match: { _id: customerId, "ShoppingCartItems.StoreId": storeId } },
        {
          $addFields: {
            "ShoppingCartItemsData": {
              $filter: {
                  input: "$ShoppingCartItems",
                  as: "item",
                  cond: { $eq : ["$$item.StoreId" , storeId] }
              }
            },
            "ShoppingCartItemsData2": {
                $filter: {
                    input: "$ShoppingCartItems",
                    as: "item",
                    cond: { $eq : ["$$item.StoreId" , storeId] }
                }
            }
          }
        },
        // {
        //     $project: {
        //         _id:0,
        //         "ShoppingCartItemsData": {
        //             $filter: {
        //                 input: "$ShoppingCartItems",
        //                 as: "item",
        //                 cond: { $eq : ["$$item.StoreId" , storeId] }
        //             }
        //         },
        //         "ShoppingCartItemsData2": {
        //             $filter: {
        //                 input: "$ShoppingCartItems",
        //                 as: "item",
        //                 cond: { $eq : ["$$item.StoreId" , storeId] }
        //             }
        //         }
        //     }
        // },
        { $unwind: { path: "$ShoppingCartItemsData2", preserveNullAndEmptyArrays: true } },
        { $lookup:
          {
            from: 'Product',
            let: { "specificationAttributeId": "$ShoppingCartItemsData2.ProductId" },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$specificationAttributeId"] } } },
            {
              $lookup: {
                from: 'ProductAttribute', localField: 'ProductAttributeMappings.ProductAttributeId',
                foreignField: '_id', as: 'ProductAttributes'
              }
            },
            // { $project: { "GenericAttributes": 0, "Locales": 0, "SpecificationAttributeOptions.Locales": 0 } }
            { $project: { 
              "_id": 1, "Name": 1,
              "ShortDescription":1,
              "FullDescription":1,
              "SeName": 1,
              "Price": 1,
              "ProductAttributeMappings": 1,
              "ProductAttributes":1,
              "ProductPictures":1
             } }
            ],
            as: "ProductsData"
          }
        },
        { $unwind: { path: "$ShoppingCartItemsData2", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$ProductsData", preserveNullAndEmptyArrays: true } },
        {
          $group:{
            "_id": "$_id",
            "ShoppingCartItemsData": { "$first": "$ShoppingCartItemsData" },
            "ProductsData": { "$addToSet": "$ProductsData" }
          }
        },
        // {
        //   $project: {
        //       "ShoppingCartItemsData": 1,
        //       "ShoppingCartItemsData2":1,
        //       "ProductsData":1
        //   }
        // },  
      ])
      .exec();
      return customerInfo?customerInfo[0]:null;
      // return customerInfo;
    }

    public async createShoppingCartItemUsingCustomerId(
        customerId: string,
        cartItemData: any
      ){
        log("Create cartItem by customer Id.");
        cartItemData._id = uuid();        
        await this.Customer
          .findOneAndUpdate({ _id: customerId }, { $push: { ShoppingCartItems: cartItemData } })
          .exec();
        return cartItemData._id;
      }

      public async updateShoppingCartItemUsingCustomerId(
        customerId: string,
        itemId: string,
        cartItemData: any
      ) {
        log("update cartItem by customer Id.", itemId);
        let updateCArtItemData = await this.Customer.updateOne(
            { _id: customerId, "ShoppingCartItems": { $elemMatch: { _id: itemId}}},
            { "$set": cartItemData}
          )
          .exec();
        return updateCArtItemData;
      }
      public async deleteCartItemByCustomerIdStoreIdAndCartItemId(
        customerId: string,
        storeId: string,
        cartItemId: string
      ){
        log("Deleting cartitem by customer Id, storeId and cartItem id.");
        const customer: any = await this.Customer
        .findOneAndUpdate({ _id: customerId, "ShoppingCartItems._id":cartItemId, "ShoppingCartItems.StoreId":storeId }, { $pull: { ShoppingCartItems: { _id: cartItemId, StoreId:storeId } } }, { new: true })
          .exec();
        return customer;
      }
}

export default new CustomerDao();
