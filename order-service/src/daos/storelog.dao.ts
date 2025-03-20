import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';
import moment from 'moment';

const log: debug.IDebugger = debug('app:store-dao');


class StoreLogDao {
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
      State:{ type: String },
      Address1: { type: String },
      Address2: { type: String },
      ZipPostalCode: { type: String },
      PhoneNumber: { type: String },
      FaxNumber: { type: String },
      Verified: { type: Boolean },
      coordinate: { lat: String, lon: String },
      default: { type: Boolean, default: false},
      createdDate: { type: Date, default: moment().utc() },
    });

    GenericAttributeSchema = new this.Schema({
      Logo: {
        type: String,
      },
      Thumbnail: {
        type: String,
      },
      Image: {
        type: String,
      },
    });

    StoreSchema = new this.Schema({
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
      CompanyAddress: {
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
      GenericAttributes: {
        type: [this.GenericAttributeSchema],
      },
      Addresses: {
        type: [this.AddressSchema],
      }
    });
      
    Store = mongooseService.getMongoose().model('Store', this.StoreSchema, 'Store');
    
    constructor() {
        log('Created new instance of AuthLogDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async findStoreInfoByStoreId(
      storeId: string
    ){
      log("Fetching stores by store Id.");
      const storeInfo: any = await this.Store.aggregate([
        { $match:  {_id:storeId} },
       { $lookup: {
          from: 'Country', localField: 'Address.CountryId',
          foreignField: '_id', as: 'Country'
        }
      },
      {
        $lookup: {
          from: 'StateProvince', localField: 'Address.StateProvinceId',
          foreignField: '_id', as: 'State'
        }
      },
      {
          $addFields: {
            "Address.Country": { $arrayElemAt: ["$Country.Name", 0] },
            "Address.StateName": { $arrayElemAt: ["$State.Name", 0] }
          }
        },
        { $group: {
          "_id": "$_id",
          "storeName": { "$first": "$Name" },
          "CompanyPhoneNumber": { "$first": "$CompanyPhoneNumber" },
          "CompanyEmail": { "$first": "$CompanyEmail" },
          'Address': { "$first": "$Address" }
        }
      }
      ]).exec();
      let storeInfoData = storeInfo[0] === undefined ? null : storeInfo[0];
      let storeInfoFinalData = storeInfoData === null ?
        undefined
        :
        {
          ...storeInfoData,
          Address: {
            ...storeInfoData.Address,
            Country: storeInfoData.Address.Country === undefined ? "" : storeInfoData.Address.Country,
            State: storeInfoData.Address.State === undefined ? "" : storeInfoData.Address.State
          }
        }
      
     return storeInfoFinalData;
    }
}

export default new StoreLogDao();
