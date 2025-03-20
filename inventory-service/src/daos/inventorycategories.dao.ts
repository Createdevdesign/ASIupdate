import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import shortid from 'shortid';
import debug from 'debug';
import { CreateStoreDto } from '../dto/create.store.dto';
import { PatchStoreDto } from '../dto/patch.store.dto';
import { PutStoreDto } from '../dto/put.store.dto';

const log: debug.IDebugger = debug('app:inventorycategory-dao');

class InventorysategoryDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;

    categorySchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        GenericAttributes: { type: [] },
        Name: { type: String, default:"" },
        Description: { type: String, default:"" },
        CategoryTemplateId: { type: String, default:null },
        MetaKeywords: { type: String, default:null },
        MetaDescription: { type: String, default:null },
        MetaTitle: { type: String, default:null },
        ParentCategoryId: { type: String, default:"" },
        PictureId: { type: String, default:null },
        PageSize: { type: Number, default:0 },
        AllowCustomersToSelectPageSize: { type: Boolean, default:true },
        PageSizeOptions: { type: String , default:null},
        PriceRanges: { type: String, default:null },
        ShowOnHomePage: { type: Boolean, default:false },
        FeaturedProductsOnHomaPage: { type: Boolean, default:false },
        ShowOnSearchBox: { type: Boolean, default:false },
        SearchBoxDisplayOrder: { type: Number, default:0 },
        IncludeInTopMenu: { type: Boolean, default:false },
        SubjectToAcl: { type: Boolean, default:true },
        CustomerRoles: { type: [ String ] },
        DisplayOrder: { type: Number, default:0 },
        HideOnCatalog: { type: Boolean, default:false },
        Published: { type: Boolean, default:false },
        LimitedToStores: { type: Boolean },
        Stores: { type: [ String ], default:[] },
        SeName: { type: String, default:null },
        Flag: { type: String, default:null },
        FlagStyle: { type: String, default:null },
        Icon: { type: String, default:null },
        DefaultSort: { type: Number, default:0 },
        CreatedOnUtc: {
            type: Date, default:new Date().toISOString()
        },
        UpdatedOnUtc: {
            type: Date,default:new Date().toISOString()
        },
        Locales: [],
        AppliedDiscounts: [],
        ExternalCategoryId: { type: String }
    });

    Category = mongooseService.getMongoose().model('Category', this.categorySchema, 'Category');

    constructor() {
        log('Created new instance of ProductDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async findProductCategoryByStoreId(storeId: string) {
        let filter: any = { Stores: [storeId], Published:true };
        const categories: any = await this.Category.aggregate([
          { $match: filter },
          { $project: { _id: 1, Name: 1, Description: 1, PictureId: 1, CustomerRoles: 1, DisplayOrder: 1, HideOnCatalog: 1, Published: 1 } }
        ]).exec();
    
        var results: any = {
          'data': categories
        }
        return results;    
    }

    async createCategory(
        categoriesData: any
      ) {
        log("Creating Categories.");
        const doc: any = await this.Category.create(categoriesData);
       return doc;
      }
      async updateProductCategoryByProductCategoryId(
        storeId: string,
        categoryId: string,
        categoryBody: any
      ) {
        log("Updating category by store Id and product id.");
        categoryBody.UpdatedOnUtc= new Date().toISOString();
        const updateCategory = await this.Category
          .findOneAndUpdate(
            { Stores: storeId, _id: categoryId },
            { $set: categoryBody }
          );
        return updateCategory;
      }
}

export default new InventorysategoryDao();
