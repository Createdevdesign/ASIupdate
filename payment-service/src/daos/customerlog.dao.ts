import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';
var unirest = require('unirest');

const log: debug.IDebugger = debug('app:customer-dao');

class CustomerLogDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;
    
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
    
    Customer = mongooseService.getMongoose().model('Customer', this.CustomerSchema, 'Customer');
    
    constructor() {
        log('Created new instance of AuthLogDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async findCustomerUsingCustomerId(customerId:string) {
      log("find customer using customerId.");
      const customerInfo: any = await this.Customer.aggregate([
        { $match: { _id: customerId } },
        {
          $project: {
            GenericAttributes: 1
          }
        },
      ]).exec();
      let customerData = customerInfo['length'] === 0?null:customerInfo[0]
      let customerStripeId = "";
      if(customerData !== null){
        customerData.GenericAttributes.filter((item:any)=> {
          // preferred-notifications
          if(item.Key === "StripeId"){
            customerStripeId = item.Value
          }
        })
      }
      return customerStripeId;
    }

    async customerCalculateTotalData(body: any, headers:any) {
      log("create user payment intent");
      let calculateTotal: any;
      
      if(body.AppType === "Store"){
        calculateTotal = await this.storeCalculateTotalData(body, headers);
      }else{
      try {
          let jsonData: any = {
            "storeId": body.StoreId,
            "orderType": body.OrderType,
            "selectedTime": body.SelectedTime,
            "AddressId": body.AddressId,
            "isTaxRequired":body.isTaxRequired
          }
          if (this.checkEmptyCondition(body.PromoCodeId)) jsonData["promotionId"]= body.PromoCodeId;
          if (!this.checkEmptyCondition(body.PromoCodeId)) jsonData["promoCode"]= body.PromoCode;
          calculateTotal = await unirest('POST', process.env.api_end_point+`/order/api/v1/me/totals`)
            .headers({
              'Content-Type': 'application/json',
              'Authorization': headers.authorization
            })
            .send(JSON.stringify(jsonData));    
        } catch (err) {
          log("calculate total error", err);
        }
      }
      log("calculate total ", calculateTotal);
      return calculateTotal;
    }

    async storeCalculateTotalData(body: any, headers:any) {
      log("store calculate totals", body);
      let calculateTotal: any;
  
      try {
        let jsonData: any = {
          "storeId": body.StoreId,
          "orderType": body.OrderType,
          "selectedTime": body.SelectedTime,
          "tipAmount": body.TipAmount,
          "products":body.Products,
          "isTaxRequired":body.isTaxRequired
        }
        if (this.checkEmptyCondition(body.PromoCodeId)) jsonData["promotionId"]= body.PromoCodeId;
        if (!this.checkEmptyCondition(body.PromoCodeId)) jsonData["promoCode"]= body.PromoCode;
        calculateTotal = await unirest('POST', process.env.api_end_point+`/order/api/v1/me/storeTotals`)
          .headers({
            'Content-Type': 'application/json',
            'Authorization': headers.authorization
          })
          .send(JSON.stringify(jsonData));    
      } catch (err) {
        log("calculate total error", err);
      }
      log("calculate total ", calculateTotal);
      return calculateTotal;
    }

    public checkEmptyCondition(condition:any) {
      return condition.toString().trim() != 'null' &&
      condition.toString().trim() != '';
     }

     async createStripeIdInCustomerCollection(
      customerId: string,
      cusotmerStripeId: string
    ) {
      log("Create stripeId by customer Id.");
      let data = {
        "Key": "StripeId",
        "Value": cusotmerStripeId,
        "StoreId": ""
      }
      await this.Customer
        .findOneAndUpdate({ _id: customerId }, { $push: { GenericAttributes: data } })
        .exec();
      return true;
    }
}

export default new CustomerLogDao();
