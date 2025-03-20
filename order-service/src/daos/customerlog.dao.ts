import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';

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

    async createShoppingCartItemUsingCustomerId(
      customerId: string,
      cartItemData: any
    ){
      log("Create cartItem by customer Id.");
      
      let customerData = await this.Customer
        .updateOne({ _id: customerId }, { $push: { ShoppingCartItems:{ $each : cartItemData} } })
        .exec();
      return customerData;
    }
}

export default new CustomerLogDao();
