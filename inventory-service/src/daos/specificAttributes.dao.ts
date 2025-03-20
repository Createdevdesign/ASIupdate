import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:specificationattributes-dao');

class InventorysategoryDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;

    ProductSpecificationAttributes = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        Name: { type: String },
        SeName: { type: String },
        ColorSquaresRgb: { type: String },
        Locales: {
          type: []
        },
        DisplayOrder: { type: Number }
    });

    productSpecificationAttributesSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        GenericAttributes: { type: [] },
        Name: { type: String },
        SeName: { type: String },
        Locales: {
            type: []
        },
        DisplayOrder: { type: Number },
        SpecificationAttributeOptions: {
            type: [this.ProductSpecificationAttributes]
        }
    });

    SpecificationAttribute = mongooseService.getMongoose().model('SpecificationAttribute', this.productSpecificationAttributesSchema, 'SpecificationAttribute');

    constructor() {
        log('Created new instance of ProductDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async getSpecificAttributeUsingCustomerId(){
        log("Fetching specification categories by store Id.");
        const specificationAttributes: any = await this.SpecificationAttribute.aggregate([
          // { $match: filter },
          { $project: { GenericAttributes: 0, Locales: 0, "SpecificationAttributeOptions.Locales": 0 } }
        ]).exec();
        var results: any = {
          'data': specificationAttributes
        }
        return results;
      }
}

export default new InventorysategoryDao();
