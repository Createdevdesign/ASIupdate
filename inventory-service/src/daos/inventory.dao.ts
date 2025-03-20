import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';
import mime from "mime-types";

const log: debug.IDebugger = debug('app:stores-dao');

class InventorysDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;

    ProductPictures = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        PictureId: { type: String },
        DisplayOrder: { type: Number },
        MimeType: { type: String },
        SeoFilename: { type: String },
        AltAttribute: { type: String },
        TitleAttribute: { type: String }
      });
      
      ProductCategory = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        CategoryId: { type: String },
        IsFeaturedProduct:{ type: Boolean },
        DisplayOrder:{ type: Number }
      });
      
      ProductAttributeValues = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        AttributeValueTypeId: { type: Number },
        AssociatedProductId: { type: String },
        Name: { type: String },
        ColorSquaresRgb: { type: String },
        ImageSquaresPictureId: { type: String },
        PriceAdjustment: { type: Number },
        WeightAdjustment: { type: Number },
        Cost: { type: Number },
        Quantity: { type: Number },
        IsPreSelected: { type: Boolean },
        DisplayOrder: { type: Number },
        PictureId: { type: String },
        Locales: [],
        ExternalAttributeId: { type: String }
      });
      
      ProductAttributeMappings = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        ProductAttributeId:{ type: String },
        TextPrompt: { type: String },
        IsRequired: { type: Boolean },
        ShowOnCatalogPage:{ type: Boolean },
        AttributeControlTypeId: { type: Number },
        DisplayOrder: { type: Number },
        ValidationMinLength: { type: Number },
        ValidationMaxLength: { type: Number },
        ValidationFileAllowedExtensions: { type: Number },
        ValidationFileMaximumSize: { type: Number },
        DefaultValue: { type: Number },
        ConditionAttributeXml: { type: String },
        Locales: [],
        ProductAttributeValues: [this.ProductAttributeValues]
      });
      
       ProductSpecificationAttributes = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        AttributeTypeId: { type: String },
        SpecificationAttributeId: { type: String },
        SpecificationAttributeOptionId: { type: String },
        CustomValue: { type: String },
        AllowFiltering: { type: Boolean },
        ShowOnProductPage: { type: Boolean },
        DisplayOrder: { type: Number }
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
      
    storesSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        Published: { type: Boolean, default: true },
        Name: {
            type: String, default: ""
        },
        ProductTypeId: {
            type: Number, default:0
        },
        ShortDescription: {
            type: String, default: ""
        },
        FullDescription: {
            type: String, default: ""
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
            type: [this.GenericAttributeSchema], default:[]
        },
        ParentGroupedProductId:{
            type: String, default: ""
        },
        VisibleIndividually: {
            type: Boolean, default: false
        },
        SeName: {
            type: String, default: ""
        },
        AdminComment: {
            type: String, default: ""
        },
        ProductTemplateId: {
            type: String, default:""
        },
        VendorId: {
            type: String, default:""
        },
        ShowOnHomePage: {
            type: Boolean, default: false
        },
        MetaKeywords: {
            type: String, default: ""
        },
        MetaDescription: {
            type: String, default: ""
        },
        MetaTitle: {
            type: String, default: ""
        },
        AllowCustomerReviews: {
            type: Boolean, default: false
        },
        ApprovedRatingSum: { type: Number, default: 0 },
        NotApprovedRatingSum: { type: Number, default: 0 },
        ApprovedTotalReviews: { type: Number, default: 0 },
        NotApprovedTotalReviews: { type: Number, default: 0 },
        SubjectToAcl: {
            type: Boolean, default: false
        },
        CustomerRoles: { type: [] },
        LimitedToStores: {
            type: Boolean, default: false
        },
        Stores: { type: [String] },
        ExternalId: {
            type: String, default: ""
        },
        Sku: {
            type: String, default: ""
        },
        ManufacturerPartNumber: {
            type: String, default: ""
        },
        Gtin: {
            type: String, default: ""
        },
        IsGiftCard: {
            type: Boolean, default: false
        },
        GiftCardTypeId: { type: Number, default: 0 },
        OverriddenGiftCardAmount: { type: Number, default: 0 },
        RequireOtherProducts: {
            type: Boolean, default: false
        },
        RequiredProductIds: {
            type: String, default: ""
        },
        AutomaticallyAddRequiredProducts: {
            type: Boolean, default: false
        },
        IsDownload: {
            type: Boolean, default: false
        },
        DownloadId: {
            type: String, default: ""
        },
        UnlimitedDownloads: {
            type: Boolean, default: false
        },
        MaxNumberOfDownloads: { type: Number, default: 0 },
        DownloadExpirationDays: { type: Number, default: 0 },
        DownloadActivationTypeId: {
            type: Number, default: 0
        },
        HasSampleDownload: {
            type: Boolean, default: false
        },
        SampleDownloadId: {
            type: String, default: ""
        },
        HasUserAgreement: {
            type: Boolean, default: false
        },
        UserAgreementText: {
            type: String, default: "" 
        },
        IsRecurring: {
            type: Boolean,default: false
        },
        RecurringCycleLength: { type: Number, default: 0 },
        RecurringCyclePeriodId: { type: Number, default: 0 },
        RecurringTotalCycles: { type: Number, default: 0 },
        IncBothDate: {
            type: Boolean, default: false
        },
        Interval: { type: Number, default: 0 },
        IntervalUnitId: {
            type: Number, default: 0
        },
        IsShipEnabled: {
            type: Boolean, default: false
        },
        IsFreeShipping: {
            type: Boolean, default: false
        },
        ShipSeparately: {
            type: Boolean, default: false
        },
        AdditionalShippingCharge: { type: Number, default: 0 },
        DeliveryDateId: {
            type: String, default: ""
        },
        IsTaxExempt: {
            type: Boolean, default: false
        },
        TaxCategoryId: {
            type: String, default: ""
        },
        IsTele: {
            type: Boolean, default: false
        },
        ManageInventoryMethodId: { type: Number, default: 0 },
        UseMultipleWarehouses: {
            type: Boolean, default: false
        },
        WarehouseId: {
            type: String, default: ""
        },
        StockQuantity: { type: Number, default: 0 },
        DisplayStockAvailability: {
            type: Boolean, default: false
        },
        DisplayStockQuantity: {
            type: Boolean, default: false
        },
        MinStockQuantity: { type: Number, default: 0 },
        LowStock: {
            type: Boolean, default: false
        },
        LowStockActivityId: { type: Number, default: 0 },
        NotifyAdminForQuantityBelow: { type: Number, default: 0 },
        BackorderModeId: { type: Number, default: 0 },
        AllowBackInStockSubscriptions: {
            type: Boolean, default: false
        },
        OrderMinimumQuantity: { type: Number, default: 0 },
        OrderMaximumQuantity: { type: Number, default: 0 },
        AllowedQuantities: {
            type: String, default: ""
        },
        AllowAddingOnlyExistingAttributeCombinations: { type: Boolean, default: false },
        NotReturnable: { type: Boolean, default: false },
        DisableBuyButton: { type: Boolean, default: false },
        DisableWishlistButton: { type: Boolean, default: false },
        AvailableForPreOrder: { type: Boolean, default: false },
        PreOrderAvailabilityStartDateTimeUtc: {
            type: String, default: null
        },
        CallForPrice: { type: Boolean, default: false },
        CatalogPrice: { type: Number, default: 0 },
        OldPrice: { type: Number, default: 0 },
        ProductCost: { type: Number, default: 0 },
        CustomerEntersPrice: { type: Boolean, default: false },
        MinimumCustomerEnteredPrice: { type: Number, default: 0 },
        MaximumCustomerEnteredPrice: { type: Number, default: 0 },
        BasepriceEnabled: { type: Boolean, default: false },
        BasepriceAmount: { type: Number, default: 0 },
        BasepriceUnitId: {
            type: String, default: ""
        },
        BasepriceBaseAmount: { type: Number, default: 0 },
        BasepriceBaseUnitId: {
            type: String, default: ""
        },
        UnitId: {
            type: String, default: ""
        },
        CourseId: {
            type: String, default: ""
        },
        MarkAsNew: { type: Boolean, default: false },
        MarkAsNewStartDateTimeUtc: {
            type: String, default: null
        },
        MarkAsNewEndDateTimeUtc: {
            type: String, default: null
        },
        Weight: { type: Number, default: 0 },
        Length: { type: Number, default: 0 },
        Width: { type: Number, default: 0 },
        Height: { type: Number, default: 0 },
        StartPrice: { type: Number, default: 0 },
        HighestBid: { type: Number, default: 0 },
        HighestBidder: {
            type: String, default: ""
        },
        AuctionEnded: { type: Boolean, default: false },
        DisplayOrder: { type: Number, default: 0 },
        DisplayOrderCategory: { type: Number, default: 0 },
        DisplayOrderManufacturer: { type: Number, default: 0 },
        CreatedOnUtc: {
            type: Date,
        },
        UpdatedOnUtc: {
            type: Date,
        },
        Sold: { type: Number, default:0 },
        Viewed: { type: Number, default:0 },
        OnSale: { type: Number, default:0 },
        Flag: {
            type: String, default:""
        },
        Locales: {
            type: [],
        },
        ProductManufacturers: {
            type: [],
        },
        ProductTags: {
            type: [],
        },
        ProductAttributeCombinations: {
            type: [],
        },
        TierPrices: {
            type: [],
        },
        AppliedDiscounts: {
            type: [],
        },
        ProductWarehouseInventory: {
            type: [],
        },
        CrossSellProduct: {
            type: [],
        },
        RelatedProducts: {
            type: [],
        },
        SimilarProducts: {
            type: [],
        },
        BundleProducts: {
            type: [],
        },
        ServiceTypes: { type: [] }
    });

    Product = mongooseService.getMongoose().model('Product', this.storesSchema, 'Product');

    constructor() {
        log('Created new instance of SProductDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async findProductsByStoreId(storeId: string,queryData: any,published: Boolean) {
        let paginationData:any =  []
        let Page = 1;
        if(queryData.page && queryData.limit){
            Page =  parseInt(queryData.page);
            const Limit = parseInt(queryData.limit);
            var Offset: number = (Page - 1) * Limit;
            paginationData =  [ { $skip: Offset }, { $limit: Limit } ]
        }
        
        let filter: any = { Stores: storeId };
        let orFilters:any = { Stores: { $size: 0 }, LimitedToStores:false };
        // name search
        if (queryData.name) {
            filter["Name"] = {'$regex': queryData.name, $options: 'i'};
            orFilters["Name"] = {'$regex': queryData.name, $options: 'i'};
        }
        // date between products
        if (queryData.dateFrom && queryData.dateTo) {
            // filter = { Stores: [storeId], CreatedOnUtc: { $gte: queryData.dateFrom.toISOString(), $lt: queryData.dateTo.toISOString() } };
            // filter = { /*Stores: [storeId],*/ CreatedOnUtc: { $gte: new Date(queryData.dateFrom), $lt: new Date(queryData.dateTo)} };
            filter["CreatedOnUtc"] = { $gte: new Date(queryData.dateFrom), $lt: new Date(queryData.dateTo)};
            orFilters["CreatedOnUtc"] = { $gte: new Date(queryData.dateFrom), $lt: new Date(queryData.dateTo)}
        }
        // active products
        if(published){
            filter.Published=published;
            orFilters["Published"]=published;
        }
        // products instore and filter inventory avaialable start time and end time
        if(queryData.inStore){
            // store related query
            filter["GenericAttributes.Key"]= {$nin:[] };
            filter["GenericAttributes.Value"]= {$nin:[] };
            orFilters["GenericAttributes.Key"]= {$nin:[] };
            orFilters["GenericAttributes.Value"]= {$nin:[] };
        }else{
            // customer related query
            filter["GenericAttributes.Key"]= {$nin:["in-store"] };
            filter["GenericAttributes.Value"]= {$nin:[true] };
            orFilters["GenericAttributes.Key"]= {$nin:["in-store"] };
            orFilters["GenericAttributes.Value"]= {$nin:[true] };
        }
        if(!queryData.inStore){
            filter["AvailableStartDateTimeUtc"]= {$not: { $gt: new Date().toISOString() }};
            filter["AvailableEndDateTimeUtc"]= {$not: { $lt: new Date().toISOString() }};
            orFilters["AvailableStartDateTimeUtc"]= {$not: { $gt: new Date().toISOString() }};
            orFilters["AvailableEndDateTimeUtc"]= {$not: { $lt: new Date().toISOString() }};
        }
        // service type queries
        if(queryData.type){
            filter["$or"]= [{ServiceTypes: {$in: queryData.type}},{ServiceTypes:{$exists:false}}]
        }
        let finalFilters = { $or: [{ $and:[filter]}, {$or:[orFilters]}]};
        log("Mongo query", filter);
        const products: any = await this.Product.aggregate(
        [
            { $match: finalFilters },
            {
            $project: {
                id: "$_id",
                _id: 0,
                ProductTypeId: 1,
                Name: 1,
                ShortDescription: 1,
                FullDescription: 1,
                Price: { $convert: { input: "$Price", to: "double" } },
                AvailableStartDateTimeUtc: 1,
                AvailableEndDateTimeUtc: 1,
                Published:1,
                "ProductCategories.CategoryId": 1,
                // "ProductCategories.DisplayOrder": 1,
                "ProductCategories.IsFeaturedProduct": 1,
                ProductSpecificationAttributes: 1,
                "Stores": 1,
                "ServiceTypes": this.aggregationConditionObjectString("$ServiceTypes", [], "$ServiceTypes"),
                "ProductPictures.PictureId": 1,
                "ProductPictures.MimeType": 1,
                "ProductPictures.SeoFilename": 1,
                "PictureUrl":process.env.assets_base_url
            },
            },
        ]
        ).facet({
        total: [{ $count: 'total' }],
        data: paginationData // add projection here wish you re-shape the docs
    } ).addFields({
        "total": {
        "$ifNull": [{ "$arrayElemAt": [ "$total.total", 0 ] }, 0]
        },
        "page": Page
        }).exec();
        return products?products[0]:null;;
    }

    public aggregationConditionObjectString(value: any, thenData:any, elseValue:any) {
        let conditionData = {
          $cond: {
            if: { $eq: [ {$ifNull:[value, undefined]}, null] },
             then: thenData,
             else: elseValue
          }
        }
        return conditionData;
    }

    async findProductByProductId(
        storeId: string,
        productId: string,
        published: Boolean
      ){
        log("Fetching product by store Id and product Id.");
        // "Stores": storeId,
        let filter: any = { "Stores": storeId,"_id": productId };
        let orfilter: any = { "_id": productId, Stores: { $size: 0 }, LimitedToStores:false };
        
        if(published){
          filter.Published=published;
          orfilter.Published=published;
        }
        let finalFilters = { $or: [{ $and:[filter]}, {$or:[orfilter]}]};
        const ProductsAggregrateData: any = await this.Product.aggregate([
          { $match: finalFilters },
          // { $match: { "_id": productId } },
          { $unwind: { path: "$ProductSpecificationAttributes", preserveNullAndEmptyArrays: true } },
          { $unwind: { path: "$ProductAttributeMappings", preserveNullAndEmptyArrays: true } },
          { $unwind: { path: "$ProductPictures", preserveNullAndEmptyArrays: true } },
          { $lookup:
            {
              from: 'SpecificationAttribute',
              let: { "specificationAttributeId": "$ProductSpecificationAttributes.SpecificationAttributeId" },
              pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$specificationAttributeId"] } } },
              { $project: { "GenericAttributes": 0, "Locales": 0, "SpecificationAttributeOptions.Locales": 0 } }
              ],
              as: "ProductSpecificAttribute"
            }
          },
          { $lookup:
            {
              from: 'Picture',
              let: { "pictureId": "$ProductPictures.PictureId" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$pictureId"] } } },
                { $project: { "_id": 0, "pictureId": "$_id", "MimeType": 1, "pictureUrl": { "$concat": [process.env.assets_base_url, "/", "$_id", "_", "$SeoFilename"] } } }
              ],
              as: "ProductPictures"
            }
          },
          { $lookup:
            {
              from: 'ProductAttribute',
              let: { 
                "productAttributeId": "$ProductAttributeMappings.ProductAttributeId",
                "id": "$ProductAttributeMappings._id",
                "isRequired": "$ProductAttributeMappings.IsRequired",
                "attributeControlTypeId": "$ProductAttributeMappings.AttributeControlTypeId",
                "displayOrder":"$ProductAttributeMappings.DisplayOrder",
                "defaultValue":"$ProductAttributeMappings.DefaultValue",
                "productAttributeValues":"$ProductAttributeMappings.ProductAttributeValues",
             },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$productAttributeId"] } } },
                { $project: { 
                  "_id":"$$id", 
                  "ProductAttributeId":"$$productAttributeId", 
                  "Name":"$Name", 
                  "IsRequired":"$$isRequired", 
                  "AttributeControlTypeId":"$$attributeControlTypeId", 
                  "DisplayOrder":"$$displayOrder", 
                  "DefaultValue":"$$defaultValue", 
                  "ProductAttributeValues":"$$productAttributeValues"  
                } },
              ],
              as: "ProductAttributeData"
              }
          },
          { $unwind: { path: "$ProductPictures", preserveNullAndEmptyArrays: true } },
          { $unwind: { path: "$ProductAttributeData", preserveNullAndEmptyArrays: true } },
          { $unwind: { path: "$ProductSpecificAttribute", preserveNullAndEmptyArrays: true } }
        ]).project({
          "MetaTitle": 0,
          "ProductAttributeData.ProductAttributeValues.AssociatedProductId": 0,
          "ProductAttributeData.ProductAttributeValues.ColorSquaresRgb": 0,
          "ProductAttributeData.ProductAttributeValues.ImageSquaresPictureId": 0,
          "ProductAttributeData.ProductAttributeValues.PictureId": 0,
          "ProductAttributeData.ProductAttributeValues.Locales": 0,
          "ProductAttributeData.ProductAttributeValues.ExternalAttributeId": 0        
        }).group({
          "_id": "$_id",
          "Name": { "$first": "$Name" },
          'ShortDescription': { "$first": "$ShortDescription" },
          'FullDescription': { "$first": "$FullDescription" },
          "Price": { "$first": { "$toDouble": "$Price" } },
          "CatalogPrice": { "$first": { "$toDouble": "$CatalogPrice" } },
          "AvailableStartDateTimeUtc": { "$first": "$AvailableStartDateTimeUtc" },
          "AvailableEndDateTimeUtc": { "$first": "$AvailableEndDateTimeUtc" },
          "LimitedToStores": { "$first": "$LimitedToStores" },
          "Stores": { "$first": "$Stores" },
          "Published": { "$first": "$Published" },
          "ServiceTypes": { "$first": this.aggregationConditionObjectString("$ServiceTypes", [], "$ServiceTypes") },
          "ProductCategories": { "$first": "$ProductCategories" },
          "ProductAttributes": { "$addToSet": "$ProductAttributeData" },
          "ProductPictures": { "$addToSet": "$ProductPictures" },
          "ProductSpecificAttribute": { "$addToSet": "$ProductSpecificAttribute" }
        }).exec();
        let ProductDetailData = ProductsAggregrateData[0] === undefined ? null : ProductsAggregrateData[0];
        
        let productImageFormat = []
        if (ProductDetailData !== null) {
          if (ProductDetailData?.ProductPictures?.length !== 0) {
            for (let i = 0; i < ProductDetailData.ProductPictures.length; i++) {
              let inventoryImageExtension:any = ProductDetailData.ProductPictures[i].MimeType === 'image/jpg'?'jpg':mime.extension(ProductDetailData.ProductPictures[i].MimeType);
              productImageFormat.push({ pictureId: ProductDetailData.ProductPictures[i].pictureId, pictureUrl: `${ProductDetailData.ProductPictures[i].pictureUrl}.${inventoryImageExtension}` })
            }
          }
    
          if(ProductDetailData?.ProductAttributes?.length > 0) {
            ProductDetailData.ProductAttributes.forEach((attribute:any) => {
              if(attribute.ProductAttributeValues !== undefined){
                attribute.ProductAttributeValues.forEach((attributeValue:any) => {
                  attributeValue.PriceAdjustment = parseFloat(attributeValue.PriceAdjustment);
                  attributeValue.WeightAdjustment = parseFloat(attributeValue.WeightAdjustment);
                  attributeValue.Cost = parseFloat(attributeValue.Cost);
                });
              }
            });
          }
        }
        let productDetailFinalData = ProductDetailData === null ? undefined : { ...ProductDetailData, ProductPictures: productImageFormat }
        
        return productDetailFinalData;
      }

      async updateprodeductAttributeByproductIdIdAndAttributeIdId(
        productId: string,
        attributeId: string,
        body: any
      ){
        log("Updating product attribute by product Id."+attributeId+"  " + productId, body);
        
        let productAttributeMappingsFinalData:any = {
          // "ProductAttributeMappings.$.IsRequired" : body.IsRequired
        }
        if(body.IsRequired !== undefined){
          productAttributeMappingsFinalData["ProductAttributeMappings.$.IsRequired"] = body.IsRequired;
        }
        if(body.ShowOnCatalogPage!== undefined){
          productAttributeMappingsFinalData["ProductAttributeMappings.$.ShowOnCatalogPage"] = body.ShowOnCatalogPage;
        }
        if(body.DisplayOrder!== undefined){
          productAttributeMappingsFinalData["ProductAttributeMappings.$.DisplayOrder"] = body.DisplayOrder;
        }
        if(body.ProductAttributeValues){
          productAttributeMappingsFinalData["ProductAttributeMappings.$.ProductAttributeValues"] = body.ProductAttributeValues;
        }
        
        log("Updating product attribute data");
        await this.Product
          .updateOne(
            { _id: productId, "ProductAttributeMappings": { $elemMatch: { "ProductAttributeId": attributeId}} },
            { "$set": productAttributeMappingsFinalData}
          )
          .exec();
        return true;
      }

      async createProductUsingCustomerId(
        productData: any
      ){
        log("Creating Product.");
        const doc: any = await this.Product.create(productData);
       return doc;
      }

      async updateProductByStoreIdAndProductId(
        storeId: string,
        productId: string,
        product: any
      ){
        log("Updating product by store Id and product id.",storeId);
        const updateProduct = await this.Product
          .findOneAndUpdate(
            { _id: productId },
            { $set: product }
          )
          .exec();
        return updateProduct;
      }

      
  public async updateAssetData(
    s3Data:any,
    productId: string,
    storeId:string,
    image: string,
    findImage: boolean
  ){
    log("Updating image url in product by product Id."+storeId);
    // const newColumn = `GenericAttributes.0.${image}`;
    // const productAssetData = {
    //   "Key": image,
    //   "Value": s3Data.Location
    //   // "GenericAttributes.$.StoreId": address.FirstName
    // }
    const findImageproductAssetData = {
      "GenericAttributes.$.Key": image,
      "GenericAttributes.$.Value": s3Data.Location
      // "GenericAttributes.$.StoreId": address.FirstName
    }
    if(findImage == true){
      let data = await this.Product.updateOne(
        { _id: productId, "GenericAttributes": { $elemMatch: { "Key": "Image"}} },
        { "$set": findImageproductAssetData}
      ).exec();
      log("Updating image in generic attributes." + data);
    }else{
      await this.Product
      .findOneAndUpdate(
        { _id: productId },
        { $push: { ProductPictures: s3Data } },
      )
      .exec();
    }
    return true;
  }

  public async updateProductImageByStoreIdAndProductId(
    storeId: string,
    productId: string,
    productPictureData: any,
    pictureId: string
  ) {
    log("Updating productpicture by product Id and store Id." + storeId);

    await this.Product
      .findOneAndUpdate(
        { _id: productId },
        { $set: { "ProductPictures.$[elem]": productPictureData } },
        {
          arrayFilters: [{ "elem.PictureId": pictureId }],
          new: true,
        }
      )
      .exec();
    return true;
  }

  public async findImageByProductIdAndPictureId(
    productId: string,
    pictureid: string
  ) {
    log("Fetching address by customer Id and address id.");
    const product: any = await this.Product
      .findOne(
        { _id: productId, "ProductPictures.PictureId": pictureid },
        { "ProductPictures.$": 1 }
      )
      .exec();
    return product;
  }

  
  
  public async deleteAssetsByProductIdAndPictureId(
    productId: string,
    pictureId: string
  ) {
    log("Deleting address by customer Id and address id.");
    const product: any = await this.Product.findOneAndUpdate({ _id: productId }, { $pull: { ProductPictures: { PictureId: pictureId } } }, { new: true }).exec();
    return product?1:0;
  }
}

export default new InventorysDao();
