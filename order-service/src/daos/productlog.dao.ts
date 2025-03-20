import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';
import moment from 'moment';

const log: debug.IDebugger = debug('app:order-dao');
const nearByOrderDistance:any = process.env.nearby_orders_distance_in_meters

class ProductLogDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;

    ProductPictures = new this.Schema({
      _id: { type: String, default: this.Types.ObjectId  },
        PictureId: { type: String },
        DisplayOrder: { type: Number },
        MimeType: { type: String },
        SeoFilename: { type: String }
      });
      
    ProductCategory = new this.Schema({
        CategoryId: { type: String }
      });
      
      
    ProductAttributeMappings = new this.Schema({
        _id: { type: String },
        ProductAttributeId:{ type: String }
      });
      
    ProductSpecificationAttributes = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId  },
      });
      
      
      GenericAttributeSchema = new this.Schema({
        Image: {
          type: String,
        },
      });
      
      
      ProductSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId  },
        Name: {
          type: String,
        },
        ProductTypeId: {
          type: String,
        },
        ShortDescription: {
          type: String,
        },
        FullDescription: {
          type: String,
        },
        Price: {
          type: Number,
        },
        AvailableStartDateTimeUtc: {
          type: String,
        },
        AvailableEndDateTimeUtc: {
          type: String,
        },
        ProductCategories: {
          type: [this.ProductCategory],
        },
        ProductPictures: {
          type: [this.ProductPictures],
        },
        ProductAttributeMappings: {
          type: [this.ProductAttributeMappings]
        },
        ProductSpecificationAttributes: {
          type: [this.ProductSpecificationAttributes]
        },
        GenericAttributes: {
          type: [this.GenericAttributeSchema],
        }
      });
      
      Product = mongooseService.getMongoose().model('Product', this.ProductSchema, 'Product');
    
    constructor() {
        log('Created new instance of AuthLogDao');
        mongooseService.getMongoose().set('debug', true);
    }
    async OrderItemsProductData(ProductIdData:any) {
      log("Product items arrray data.");
      
        let getOrderSchedulerLatestData = await this.Product.aggregate([
            { $match: { _id: {$in: ProductIdData }} },
            // { $unwind: { path: "$ProductAttributeMappings", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'ProductAttribute', localField: 'ProductAttributeMappings.ProductAttributeId',
                foreignField: '_id', as: 'ProductAttributes'
              }
            },
            { $project: {
              "_id": 1, "Name": 1,
              "SeName": 1,
              "Price": 1,
              "ProductAttributeMappings": 1,
              "ProductAttributes":1
            }},
        ]).exec();
      return getOrderSchedulerLatestData;
    }
}

export default new ProductLogDao();
