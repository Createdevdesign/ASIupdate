import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import shortid from 'shortid';
import debug from 'debug';
import { CreateStoreDto } from '../dto/create.store.dto';
import { PatchStoreDto } from '../dto/patch.store.dto';
import { PutStoreDto } from '../dto/put.store.dto';
import moment from 'moment';

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

    StateProvinceSchema = new this.Schema({
      _id: { type: String, default: this.Types.ObjectId },
      GenericAttributes: {
        type: Array,
      },
      CountryId: {
        type: String,
      },
      Name: {
        type: String,
      },
      Abbreviation: {
        type: String,
      },
      Published: {
        type: Boolean,
      },
      DisplayOrder: {
        type: Number,
      },
      Locales: {
        type: Array,
      },

    });
  

    Store = mongooseService.getMongoose().model('Store', this.StoreSchema, 'Store');
    StateProvince = mongooseService.getMongoose().model('StateProvince', this.StateProvinceSchema, 'StateProvince');
    constructor() {
        log('Created new instance of StoreDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async addStore(storeFields: CreateStoreDto) {
        const storeId = shortid.generate();
        const store = new this.Store({
            _id: storeId,
            ...storeFields,
        });
        await store.save();
        return storeId;
    }

    async getUserByEmail(email: string) {
        return this.Store.findOne({ email: email }).exec();
    }

    async removeStoreById(storeId: string) {
        return this.Store.deleteOne({ _id: storeId }).exec();
    }
    async getStoreById(storeId: string) {
      return this.Store.deleteOne({ _id: storeId }).exec();
    }
    async getStoreByStoreId(storeId: string) {
      log("Fetching stores by store Id.");
      const doc: any = await this.Store.findById(storeId).exec();
      return doc;
    }
    
    async getStoreByStoreidAndCustomerId(storeId: string, customerId:string) {
      log("Fetching stores by store Id.");
      const store: any = await this.Store.aggregate([
        { $match:  {_id:storeId} },
        {$lookup:{
          from: 'Customer',
          let: { "customerId": customerId },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$customerId"] } } },
          {
            $addFields: {
              "ShoppingCartItemsData2": {
                $filter: {
                    input: "$ShoppingCartItems",
                    as: "item",
                    cond: { $eq : ["$$item.StoreId" , storeId] }
                }
              }
            }
          },
          { $project: { 
            "_id": 1,
            "ShoppingCartItemsData2": "$ShoppingCartItemsData2"
           } }
          ],
          as: "ShoppingCartCount"
        }},
        // { $unwind: { path: "$GenericAttributes", preserveNullAndEmptyArrays: true } },
        { $unwind:  { path: "$Address", preserveNullAndEmptyArrays: true } },
        { $unwind:  { path: "$Configuration", preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            "CartItemsCount": this.aggregationConditionArray("$ShoppingCartCount.ShoppingCartItemsData2",[] )
          }
        },
        {
          $project: {
            _id:1,
            StoreName: "$Name",
            Email: "$CompanyEmail",
            PhoneNumber: "$CompanyPhoneNumber",
            ThumbnailImage: this.aggregationConditionStringObject("$Configuration.Assets","$Configuration.Assets.Thumbnail","" ),
            Logo: this.aggregationConditionStringObject("$Configuration.Assets","$Configuration.Assets.Logo","" ),
            Image: this.aggregationConditionStringObject("$Configuration.Assets","$Configuration.Assets.Image","" ),
            URL: "$Url",
            Hours: "$CompanyHours",
            PayAtStore:"$PayAtStore",
            IsDelivery: "$Configuration.IsDelivery",
            IsPickup: "$Configuration.IsPickUp",
            Address:"$Address",
            Tags: this.aggregationConditionString("$Tags",[]),
            CartItemsCount:{ $cond: { if: { $isArray: "$CartItemsCount" }, then: { $size: "$CartItemsCount" }, else: 0} }
          }
        },
      ]).exec();
      let StoreInfoData = store[0] === undefined ? null : store[0];
      let storeInfoFinalData = StoreInfoData === null ?
        undefined
        :
        {
          ...StoreInfoData,
          ThumbnailImage: StoreInfoData.ThumbnailImage === undefined?"":StoreInfoData.ThumbnailImage,
          Logo: StoreInfoData.Logo === undefined?"":StoreInfoData.Logo,
          Image: StoreInfoData.Image === undefined?"":StoreInfoData.Image,
        }
      // return store[0];
      return storeInfoFinalData;
        // return this.Store.findOne({ _id: storeId }).populate('Store').exec();
    }

    async getStores(limit = 25, page = 0) {
        return this.Store.find()
            .limit(limit)
            .skip(limit * page)
            .exec();
    }

    async updateStoreById(
        storeId: string,
        storeFields: PatchStoreDto | PutStoreDto
    ) {
        const existingStore = await this.Store.findOneAndUpdate(
            { _id: storeId },
            { $set: storeFields },
            { new: true }
        ).exec();

        return existingStore;
    }

    
  async findStoresByCustomerId(
    customerId:any,
    queryData: any,
    Latitude: any, 
    Longitude: any
  ) {
    log("Fetching all stores.");
    let paginationData:any =  []
    let Page = 1;
    if(queryData.page && queryData.limit){
      Page = parseInt(queryData.page);
      const Limit = parseInt(queryData.limit);
      var Offset: number = (Page - 1) * Limit;
      paginationData =  [ { $skip: Offset }, { $limit: Limit } ]
    }
    // await this._model.createIndexes({"Address.Geometry":"2dsphere"});
    let filter: any = { Name: {'$regex': queryData.search === undefined?"":queryData.search, $options: 'i'}, "Configuration.Active":{$in:[true, undefined]} };
    if (queryData.type) {
      filter = { Name: {'$regex': queryData.search === undefined?"":queryData.search, $options: 'i'},
            "Configuration.Tags": {'$regex': queryData.type, $options: 'i'}, "Configuration.Active":{$in:[true, undefined]}       
      };
    }
    let storeListAggregation: any = [
      { $match:  filter},
      {
        $lookup: {
          from: 'Country', localField: 'Address.CountryId',
          foreignField: '_id', as: 'Country'
        }
      },
      {$lookup:{
        from: 'CustomerRatings',
        let: { "storeId": "$_id" },
        pipeline: [
          {$unwind : { path: "$CustomerRatings", preserveNullAndEmptyArrays: true }},
          { $match: { $expr: { $eq: ["$CustomerRatings.StoreId", "$$storeId"] } } },
          {
            $group: {
                _id: null,
                TotalRatingCount: { $sum: "$CustomerRatings.Ratings" },
                Count: {    $sum: 1 }
            }
          }
          ,
          {
            $unwind: "$TotalRatingCount"
          }, {
            $group: {
              _id: null,
              TotalRatingCount: { $first: "$TotalRatingCount" },
              Count:{ $first:"$Count" }
            }
          },
          { $project: { /*TotalRatingCount: 1,*/TotalReviewCount:"$Count", StoreRating: { $divide: [ "$TotalRatingCount", "$Count" ] }} }
        ],
        as: "Ratings"
      }},
      {$lookup:{
        from: 'CustomerRatings',
        let: { "storeId": "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$CustomerId", customerId] } } },
          {$unwind : { path: "$CustomerRatings", preserveNullAndEmptyArrays: true }},
          { $match: { $expr: { $eq: ["$CustomerRatings.StoreId", "$$storeId"] } } }
        ],
        as: "RatingsData"
      }},
      {$unwind : { path: "$Country", preserveNullAndEmptyArrays: true }},
      {
        $addFields: {
          "Ratings.CustomerRating":{
            $cond: {
              if: { $eq: [ {$ifNull:[{ $arrayElemAt: ["$RatingsData", 0] }, undefined]}, null] },
               then: 0,
               else: { $arrayElemAt: ["$RatingsData.CustomerRatings.Ratings", 0] }
            }
          },
          "Address.Country": this.aggregationConditionString("$Country.Name", ""),
          "Address.Distance": this.aggregationConditionString("$Distance", ""),
          "IsDeliveryEnabled": this.aggregationConditionString("$Configuration.SupportsDelivery", false),
          "IsPickupEnabled": this.aggregationConditionString("$Configuration.IsPickUp", false),
          ThumbnailImage: this.aggregationConditionStringObject("$Configuration.Assets","$Configuration.Assets.Thumbnail","" ),
          Logo: this.aggregationConditionStringObject("$Configuration.Assets","$Configuration.Assets.Logo","" ),
          Image: this.aggregationConditionStringObject("$Configuration.Assets","$Configuration.Assets.Image","" ),
        }
      },
      { $sort: { "Address.Distance": 1 } },
      {
        $project: {
          _id:1,
          Name: "$Name",
          Email:"$CompanyEmail",
          CompanyHours:"$CompanyHours",
          IsDeliveryEnabled:"$IsDeliveryEnabled",
          IsPickupEnabled:"$IsPickupEnabled",
          Address: {
            $cond: {
               if: { $eq: [ {$ifNull:["$Address._id", null]}, null] },
               then: {},
               else: "$Address"
            }
          },
         ThumbnailImage: "$ThumbnailImage",
         Logo: "$Logo",
         Image: "$Image",
         Cuisines: this.aggregationConditionString("$Tags",[]),
         Ratings:{
          $cond: {
             if: { $eq: [ {$ifNull:[{ $arrayElemAt: ["$Ratings", 0] }, undefined]}, null] },
             then: {},
             else: { $arrayElemAt: ["$Ratings",0]}
          }
        },
        }
      },
    ]
    if(queryData.geoDistance){
      storeListAggregation.unshift({ "$geoNear":{
        near: { type: "Point", coordinates: [ parseFloat(Longitude) , parseFloat(Latitude) ] },
        distanceField: "Distance",
        maxDistance: parseInt(queryData.geoDistance),
        key:"Address.Geometry",
        spherical: true
      } });
    }  
    const stores: any = await this.Store.aggregate(storeListAggregation)
      .facet({
        total: [{ $match: filter }, { $count: 'total' }],
      data: paginationData // add projection here wish you re-shape the docs
      } ).addFields({
        "total": {
          "$ifNull": [{ "$arrayElemAt": [ "$total.total", 0 ] }, 0]
        },
        "page": Page
        }).exec();
    var results: any = stores?stores[0]:null;
    return results;
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

  public aggregationConditionArray(value: any, thenData:any) {
    let conditionData = {
      $cond: {
        if: { $eq: [ {$ifNull:[{ $arrayElemAt: [value, 0] }, undefined]}, null] },
         then: thenData,
         else: { $arrayElemAt: [value, 0] }
      }
    }
    return conditionData;
  }

  public async findGeoNearDistance(
    storeId: any,
    addressData: any
  ) {
    log("Fetching all stores.");
    // await this._model.createIndexes({"Address.Geometry":"2dsphere"});
    let storeListAggregation: any = [
      { "$geoNear":{
        near: { type: "Point", coordinates: [ parseFloat(addressData.Coordinates.lon), parseFloat(addressData.Coordinates.lat) ] },
        distanceField: "Distance",
        key:"Address.Geometry",
        spherical: true
      } },
      { $match:  {_id:storeId}},
      { $sort: { "Distance": 1 } },
      {
        $project: {
          _id:1,
          Distance:1
        }
      },
    ]
    const stores: any = await this.Store.aggregate(storeListAggregation).exec();
    var results: any = stores?stores[0]:null;
    return results;
  }

  async createStoreUsingCustomerId(
    storeData: any
  ) {
    log("Creating Store.");
    const doc: any = await this.Store.create(storeData);
   return doc;
  }

  public async findStoreByStoreId(
    storeId: string
  ) {
    log("Fetching stores by store Id.");

    const stores: any = await this.Store.aggregate([
      { $match: { _id: storeId } },
      {
        $project: {
          _id:1,
          GenericAttributes:1,
          Configuration:1
        }
      },
    ]).exec();
    return stores[0];
  }

  public async updateAssetData(
    s3Data:any,
    storeId: string,
    type: string,
    genericAttributeDataFound:any
  ){
    log("Updating asset url in store by store Id.");
    const newColumn = `Configuration.Assets.${type}`;
    
    await this.Store
      .findOneAndUpdate(
        { _id: storeId },
        { $set: { [newColumn] : s3Data.Location } },
      )
      .exec();
    return true;
  }

  public async findStoreInfoByStoreId(
    storeId: string
  ) {
    log("Fetching stores by store Id.");
    const store: any = await this.Store.aggregate([
      { $match:  {_id:storeId} },
      // { $unwind: { path: "$GenericAttributes", preserveNullAndEmptyArrays: true } },
      { $unwind:  { path: "$Address", preserveNullAndEmptyArrays: true } },
      { $unwind:  { path: "$Configuration", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id:1,
          StoreName: "$Name",
          Email: "$CompanyEmail",
          PhoneNumber: "$CompanyPhoneNumber",
          Thumbnail: this.aggregationConditionStringObject("$Configuration.Assets","$Configuration.Assets.Thumbnail","" ),
          Logo: this.aggregationConditionStringObject("$Configuration.Assets","$Configuration.Assets.Logo","" ),
          Image: this.aggregationConditionStringObject("$Configuration.Assets","$Configuration.Assets.Image","" ),
          URL: "$Url",
          Hours: "$CompanyHours",
          PayAtStore:"$PayAtStore",
          IsDelivery: "$Configuration.IsDelivery",
          IsPickup: "$Configuration.IsPickUp",
          Address:"$Address",
          Tags: this.aggregationConditionString("$Tags",[])
        }
      },
    ]).exec();
    let StoreInfoData = store[0] === undefined ? null : store[0];
    let storeInfoFinalData = StoreInfoData === null ?
      undefined
      :
      {
        ...StoreInfoData,
        Thumbnail: StoreInfoData.Thumbnail === undefined?"":StoreInfoData.Thumbnail,
        Logo: StoreInfoData.Logo === undefined?"":StoreInfoData.Logo,
        Image: StoreInfoData.Image === undefined?"":StoreInfoData.Image,
      }
    // return store[0];
    return storeInfoFinalData;
  }

  public async deleteAssetData(
    storeId: string,
    type: string
  ){
    log("Updating asset url in store by store Id.");
    const newColumn = `Configuration.Assets.${type}`;
    
    await this.Store
      .findOneAndUpdate(
        { _id: storeId },
        { $set: { [newColumn] : "" } },
      )
      .exec();
    return true;
  }
  async getStateProvincess() {
    const getStateProvincess = await this.StateProvince
    .aggregate([
      { "$project": {
          "_id": 0,
          "stateProvinceId": "$_id",
          "displayOrder": "$DisplayOrder",
          "stateProvinceCode": "$Abbreviation",
          "name": "$Name"
      }}
  ])
  console.log(getStateProvincess);
    return getStateProvincess;
  
  
    // return this.Store.findOne({ _id: storeId }).populate('Store').exec();
}

public async updateStoreHours(
  storeId: string,
  CompanyHours:any
){
  const updateStoreHours = await this.Store.findOneAndUpdate({'_id':storeId},{CompanyHours:CompanyHours}).exec();
 return updateStoreHours;
}
}

export default new StoresDao();
