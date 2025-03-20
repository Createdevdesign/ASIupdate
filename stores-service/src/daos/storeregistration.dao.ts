import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:stores-dao');

class StoresDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;
    
    GeometrySchema = new this.Schema({
      type: {
        type: String,
      },
      coordinates: []
    });
    
    AddressSchema = new this.Schema({
      _id: { type: String, default: this.Types.ObjectId },
      CountryId: { type: String },
      StateProvinceId: { type: String },
      City: { type: String },
      State:{ type: String },
      Address1: { type: String },
      Address2: { type: String },
      ZipPostalCode: { type: String },
      Coordinates: { lat: String, lon: String },
      Geometry: this.GeometrySchema,
      Verified: { type: Boolean }
    });
    
    GenericAttributeSchema = new this.Schema({
      _id : false,
      Key: {
        type: String,
      },
      Value: {
        type: String
      },
      StoreId:{
        type:String
      }
    });
    
    DeliveryFeesByPostalCodeSchema = new this.Schema({
      PostalCodes: {
        type: [],
      },
      Charge:{
        type: Number
      },
      CartAmount: {
        Min: Number, 
        Max: Number
      },
    });
    
    DeliveryFeesByRadiusSchema = new this.Schema({
      Radius: {
        Min: Number, 
        Max: Number
      },
      Charge:{
        type: Number
      },
      CartAmount: {
        Min: Number, 
        Max: Number
      },
    });
    
    ConfigurationSchema = new this.Schema({
      _id : false,
      IsDelivery: {
        type: Boolean, default: false
      },
      IsPickUp: {
        type: Boolean, default: false
      },
      SupportsDelivery: {
        type: Boolean, default: false
      },
      PickupCalendarDays: {
        type: Number
      },
      PickupTimeInterval:{
        type: Number
      }, 
      DeliveryCalendarDays: {
        type: Number
      },
      DeliveryTimeInterval:{
        type: Number
      },
      Assets: {
        Thumbnail: String, 
        Logo: String,
        Image: String
      },
      DeliveryFeesByPostalCode: {
        type: [this.DeliveryFeesByPostalCodeSchema],
      },
      DeliveryFeesByRadius: {
        type: [this.DeliveryFeesByRadiusSchema],
      },
      Active: {
        type: Boolean, default: false
      },
    });
    
    StoreRegistrationSchema = new this.Schema({
      _id: { type: String, default: this.Types.ObjectId },
      Name: {
        type: String,
      },
      CompanyHours: {
        type: String,
      },
      Url: {
        type: String,
      },
      CompanyName: {
        type: String,
      },
      PayAtStore: {
        type: Boolean,
      },
      IsDefault: {
        type: Boolean,
      },
      CompanyEmail: {
        type: String,
      },
      CompanyPhoneNumber: {
        type: String,
      },
      CompanyAddress: {
        type: String,
      },
      GenericAttributes: {
        type: [this.GenericAttributeSchema],
      },
      Address: {
        type: this.AddressSchema,
      },
      Configuration: {
        type: this.ConfigurationSchema
      },
      Tags:{
        type: Array
      },
      CompanyVat: {
        type: Number,
      },
      SslEnabled: {
        type: Boolean,
      },
      DefaultLanguageId: {
        type: Number,
      },
      DefaultWarehouseId: {
        type: Number,
      },
      CreatedDateOnUtc: {
        type: Date,
      },
    });

    StoreRegistration = mongooseService.getMongoose().model('StoreRegistration', this.StoreRegistrationSchema, 'StoreRegistration');

    constructor() {
        log('Created new instance of StoreDao');
        mongooseService.getMongoose().set('debug', true);
    }
    async findStoreRegistrationByGenericAttributesKey(
      key: string
    ) {
      log("Fetching address by customer Id and address id.");
      const storeRegistration: any = await this.StoreRegistration
        .findOne(
          { "GenericAttributes.Value": key }
        )
        .exec();
      return storeRegistration;
    }

    async activateStoreRegistrationByKey(
      key: string
    ){
      log("activate  store.");
      const doc: any = await this.StoreRegistration.findOneAndUpdate({"GenericAttributes.Value":key},{"Configuration.Active":true}).exec();
     return doc;
    }
}

export default new StoresDao();
