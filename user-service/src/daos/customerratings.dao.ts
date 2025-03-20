import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:customerrating-dao');

class CustomerRatingsDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;
    GenericAttributesSchema = new this.Schema({
      _id : false,
      StoreId: {
        type: String,
      },
      Ratings: {
        type: Number,
      }
    });

    customerRatingSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        CustomerId: { type: String },
        CustomerRatings: {
          type: [this.GenericAttributesSchema],
        }
    });

    CustomerRating = mongooseService.getMongoose().model('CustomerRatings', this.customerRatingSchema, 'CustomerRatings');
    
    constructor() {
        log('Created new instance of CustomerRatingDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async findUserRatingsusingCustomerId(customerId:string) {
      log("find user ratings.", customerId);
      
      const userRolesInfo: any = await this.CustomerRating.aggregate([
        { $match: { CustomerId:customerId } },
        ]).exec();
      return userRolesInfo?userRolesInfo[0]:null;
    }

    async findOneAndUpdateUserRating(
      customerId: string,
      body:any
    ){
       let data = await this.CustomerRating.findOneAndUpdate(
          { CustomerId: customerId },
          { $set: { "CustomerRatings.$[elem]": {StoreId:body.storeId, Ratings:body.ratings} } },
          {
            arrayFilters: [{ "elem.StoreId": body.storeId }],
            new: true,
          }
        ).exec();
        log("Updating user rating data.",data);
      
      return data;
    }
    
    async findOneAndUpdatePushUserRating(
      customerId: string,
      body:any
    ){
      let data = await this.CustomerRating
                .findOneAndUpdate(
                  { CustomerId: customerId },
                  { $push: { CustomerRatings: {StoreId:body.storeId, Ratings:body.ratings} } },
                )
                .exec();
      log("Insert new storeId in existing user rating.",data);
      
      return data;
    }

    async createUserRatings(body: any){
      log("creating configuration.");
      const createStoreConfig:any= await this.CustomerRating.create(body);
      return createStoreConfig;
    }

    async findUserTotalRating(
      customerId: string,
      body:any
    ){
      log("Insert new data.",customerId);
      let data = await this.CustomerRating.aggregate([
        { $match: {"CustomerRatings.StoreId": body.storeId} },
        {  $unwind: "$CustomerRatings"},
        { $match: {"CustomerRatings.StoreId": body.storeId} },
        {
               $group: {
                    _id: null,
                    TotalRatingCount: { $sum: "$CustomerRatings.Ratings" },
                    Count: {    $sum: 1 }
            }
          },{
            $unwind: "$TotalRatingCount"
          }, {
            $group: {
              _id: null,
              TotalRatingCount: { $first: "$TotalRatingCount" },
              Count:{ $first:"$Count" }
            }
          },
          { $project: { /*TotalRatingCount: 1,*/TotalReviewCount:"$Count", StoreRating: { $divide: [ "$TotalRatingCount", "$Count" ] }} }
        ]).exec();
      log("Insert new storeId in existing user rating.",data);
      let finalRatingData = data[0] === undefined ? null : data[0];
      if(finalRatingData !== null){
        finalRatingData.CustomerRating = body.Ratings;
      }
      return finalRatingData;
    }
}

export default new CustomerRatingsDao();
