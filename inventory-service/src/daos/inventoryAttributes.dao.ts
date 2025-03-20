import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import shortid from 'shortid';
import debug from 'debug';
import { CreateStoreDto } from '../dto/create.store.dto';
import { PatchStoreDto } from '../dto/patch.store.dto';
import { PutStoreDto } from '../dto/put.store.dto';

const log: debug.IDebugger = debug('app:inventoryattributes-dao');

class InventorysAttributesDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;
    
    PredefinedProductAttributeSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        Name: { type: String },
        PriceAdjustment: { type: Number },
        WeightAdjustment: { type: Number },
        Cost: { type: Number },
        IsPreSelected: { type: Boolean },
        DisplayOrder: { type: Number },
        Locales: [],
        ExternalAttributeId: { type: String }
      });
      
      GenericAttributeSchema = new this.Schema({
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
    invenotryAttributeSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        GenericAttributes: {
            type: [this.GenericAttributeSchema],
        },
        Name:{ type: String },
        SeName: { type: String },
        Description: { type: String },
        PredefinedProductAttributeValues: [this.PredefinedProductAttributeSchema],
        Locales: []
    });

    ProductAttribute = mongooseService.getMongoose().model('ProductAttribute', this.invenotryAttributeSchema, 'ProductAttribute');

    constructor() {
        log('Created new instance of SProductAttributeDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async getProductAttributeUsingCustomerId(storeId:string, queryData:any) {
        log("Fetching product Attributes by store Id.");
        let paginationData:any =  []
        let Page = 1;
        if(queryData.page && queryData.limit){
          Page = parseInt(queryData.page);
          const Limit = parseInt(queryData.limit);
          var Offset: number = (Page - 1) * Limit;
          paginationData =  [ { $skip: Offset }, { $limit: Limit } ]
        }
        let matchedData = { $or: [{ "GenericAttributes.StoreId": storeId },{ "GenericAttributes.StoreId": { $exists: false } }]};
        const productAttributes: any = await this.ProductAttribute.aggregate([
          { $facet:{
            total: [
              {$match: matchedData},
              { $count: 'total' }
            ],
            data: [
              {$match:matchedData},...paginationData,
              { $project: { GenericAttributes: 0, Locales: 0, "PredefinedProductAttributeValues.Locales": 0 } }    
            ]} },
          {
            $addFields:{
              "total": {
                "$ifNull": [{ "$arrayElemAt": [ "$total.total", 0 ] }, 0]
              },
              "page": Page
            }
          }
        ])
        .exec();
    
        return productAttributes?productAttributes[0]:null;;
      }
    
      async createProductAttributes(
        productAttributedData: any
      ) {
        log("Creating productAttributes.");
        const doc: any = await this.ProductAttribute.insertMany(productAttributedData);
        return doc;
      }
}

export default new InventorysAttributesDao();
