import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:discount-dao');

class DiscountLogDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;
    
    DiscountSchema = new this.Schema({
      _id: { type: String, default: this.Types.ObjectId },
      Name: {
        type: String,
      },
      typeId: {
        type: Number,
      },
      UsePercentage: {
        type: Boolean,
      },
      DiscountPercentage: {
        type: String,
      },
      DiscountAmount: {
        type: String,
      },
      MaximumDiscountAmount: {
        type: String,
      },
      RequiresCouponCode: {
        type: String,
      },
      IsEnabled: {
        type: Boolean,
      }
    });
    
    Discount = mongooseService.getMongoose().model('Discount', this.DiscountSchema, 'Discount');
    
    constructor() {
        log('Created new instance of AuthLogDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async findDiscountUsingStoreId(
      queryData: any,
      storeId: string
    ){
      log("Fetching all promo coupons from discount collection.");
      let projectData = {
        $project: {
          _id:1,
          Name: "$Name",
          typeId:"$DiscountTypeId",
          UsePercentage:this.aggregationConditionString("$UsePercentage", false),
          DiscountPercentage: this.aggregationConditionString({ $toDouble: "$DiscountPercentage"}, null),
          DiscountAmount: this.aggregationConditionString({ $toDouble: "$DiscountAmount" }, null),
          MaximumDiscountAmount:this.aggregationConditionString({ $toDouble: "$MaximumDiscountAmount" }, null),
          RequiresCouponCode: this.aggregationConditionString("$RequiresCouponCode", ""),
          Codes:"$Code.CouponCode"
        }
      }
      let paginationData:any =  [projectData]
      let Page = 1;
      if(queryData.page && queryData.limit){
        Page = parseInt(queryData.page);
        const Limit = parseInt(queryData.limit);
        var Offset: number = (Page - 1) * Limit;
        paginationData =  [ { $skip: Offset }, { $limit: Limit }, projectData ]
      }
      let filter:any = {IsEnabled:true, $and:[{StartDateUtc:{$lte:new Date()}},{EndDateUtc:{$gte:new Date()}}, { $or: [ { Stores:storeId}, { LimitedToStores:false}]}]};
      let storePromotionListAggregation: any = [
        {$match: filter},
        {
          $lookup: {
            from: 'DiscountCoupon', localField: '_id',
            foreignField: 'DiscountId', as: 'Code'
          }
        }
      ]
      const storePromotion: any = await this.Discount.aggregate(storePromotionListAggregation)
        .facet({
          total: [ {$match: filter},{ $count: 'total' }],
          data: paginationData // add projection here wish you re-shape the docs
        } )
        .addFields({
          "total": {
            "$ifNull": [{ "$arrayElemAt": [ "$total.total", 0 ] }, 0]
          },
          "page": Page
        })
        .exec();
      var results: any = storePromotion?storePromotion[0]:null;
      return results;
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
}

export default new DiscountLogDao();
