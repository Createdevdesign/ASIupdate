import StoresDao from '../daos/stores.dao';
import { CRUD } from '@swiftserve/node-common';
import { CreateStoreDto } from '../dto/create.store.dto';
import { PutStoreDto } from '../dto/put.store.dto';
import { PatchStoreDto } from '../dto/patch.store.dto';
import InventoryDao from '../daos/inventory.dao';
import InventoryCategoriesDao from '../daos/inventorycategories.dao';
import InventoryAttributesDao from '../daos/inventoryAttributes.dao';
import moment from 'moment';
import { v4 as uuid } from "uuid";
import path from 'path';
import debug from 'debug';
import pictureDao from '../daos/picture.dao';
import awsService from './aws.service';
// import mime from "mime";
// const Mime = require('mime/Mime');
const mime = require('mime-types')

const log: debug.IDebugger = debug('app:inventory-service');

class InventoryService implements CRUD {
    async create(resource: CreateStoreDto) {
        return StoresDao.addStore(resource);
    }

    async deleteById(id: string) {
        return StoresDao.removeStoreById(id);
    }

    async list(limit: number, page: number) {
        return StoresDao.getStores(limit, page);
    }

    async patchById(id: string, resource: PatchStoreDto): Promise<any> {
        return StoresDao.updateStoreById(id, resource);
    }

    async putById(id: string, resource: PutStoreDto): Promise<any> {
        return StoresDao.updateStoreById(id, resource);
    }

    async readById(id: string) {
        return StoresDao.getStoreById(id);
    }

    async updateById(id: string, resource: CreateStoreDto): Promise<any> {
        return StoresDao.updateStoreById(id, resource);
    }

    async getProductsByStoreId(storeId: string, queryData: any, published:boolean, res:any): Promise<any> {
        const myProducts: any = await InventoryDao.findProductsByStoreId(
            storeId,
            queryData,
            published
        );
        const categories:any = await InventoryCategoriesDao.findProductCategoryByStoreId(storeId)
        if (myProducts && categories) {
            myProducts.productCategories = categories.data;
            myProducts.page = myProducts.page;
            return myProducts;
      } else {
        return res.status(404).send({errors:['Products does not exists.']})
      }
    }

    async getProductsAttributesByStoreId(storeId: string, queryData: any, res:any): Promise<any> {
        const getSpecificationAttributesData: any = await InventoryAttributesDao.getProductAttributeUsingCustomerId(
            storeId,
            queryData
        );
        if (getSpecificationAttributesData) {
            getSpecificationAttributesData.data = await this.productsAttributeFilterData(getSpecificationAttributesData.data);
            return getSpecificationAttributesData;
        } else {
        return res.status(404).send({errors:['Products does not exists.']})
      }
    }

    async productsAttributeFilterData(productAttribute: any) {
        let ProductRequiredData:any = []
        productAttribute.forEach((product:any)  => {
          let predefinedProductAttributeValueData:any = []
          product.PredefinedProductAttributeValues.forEach((productAttributeValues:any) => {
            predefinedProductAttributeValueData.push({ 
                _id: productAttributeValues._id,
                Name: productAttributeValues.Name,
                PriceAdjustment: parseFloat(productAttributeValues.PriceAdjustment), 
                WeightAdjustment: parseFloat(productAttributeValues.WeightAdjustment), 
                Cost: parseFloat(productAttributeValues.Cost), 
                IsPreSelected: productAttributeValues.IsPreSelected,
                DisplayOrder: productAttributeValues.DisplayOrder,
                ExternalAttributeId: productAttributeValues.ExternalAttributeId
              })
          });
          ProductRequiredData.push({ 
            _id: product._id, 
            Name: product.Name, 
            SeName: product.SeName, 
            Description: product.Description, 
            PredefinedProductAttributeValues: predefinedProductAttributeValueData, 
            ExternalAttributeId: product.ExternalAttributeId
          })
        });
        return ProductRequiredData;
      }
      async getProductByStoreIdAndProductId(storeId: string, productId: string, published:Boolean, res:any){
          let stores:any = await InventoryDao.findProductByProductId(
            storeId,
            productId,
            published
          );
          if(!stores){
            return res.status(404).send({errors:['No store founds']})
          }
          return stores;
      }

      async updateProductAttributeUsingProductIdAndProductAttributeId(
        storeId: string,
        productId:string,
        attributeId:string,
        bodyData: any
      ){
        let updateProductAttribute:any = await InventoryDao.updateprodeductAttributeByproductIdIdAndAttributeIdId(
          productId,
          attributeId,
          bodyData
        );
        return updateProductAttribute;
      }

      stringAttribute(stringData:any):Promise<String>{
        let stringObject = stringData === undefined ||stringData === "" ||stringData === null?"":stringData;
        return stringObject;
      }
      booleanAttribute(booleanData:any){
        let booleanAttribute = booleanData === "true" ||booleanData === true?true:false;
        return booleanAttribute;
      }
      integerAttribute(integerData:any){
        let integerAttribute = integerData === undefined ||integerData === "" ||integerData === null?0:integerData;
        return integerAttribute;
      }
      integerNullAttribute(integerData:any){
        let integerAttribute = integerData === undefined ||integerData === "" ||integerData === null?null:integerData;
        return integerAttribute;
      }
      arrayAttribute(arrayData:any){
        let arrayAttribute = arrayData === undefined ||arrayData === "" ||arrayData === null?[]:arrayData;
        return arrayAttribute;
      }   
    async productObjectData(productObject:any){
    // let productObjectData = {}

    if(productObject.Name) productObject["Name"] = this.stringAttribute(productObject.Name);
    if(productObject.ParentGroupedProductId) productObject["ParentGroupedProductId"] = this.stringAttribute(productObject.ParentGroupedProductId);
    if(productObject.VisibleIndividually) productObject["VisibleIndividually"] = this.booleanAttribute(productObject.VisibleIndividually);
    if(productObject.SeName) productObject["SeName"] = this.stringAttribute(productObject.SeName);
    if(productObject.ShortDescription) productObject["ShortDescription"] = this.stringAttribute(productObject.ShortDescription);
    if(productObject.FullDescription) productObject["FullDescription"] = this.stringAttribute(productObject.FullDescription);
    if(productObject.ProductTypeId) productObject["ProductTypeId"] = this.integerAttribute(productObject.ProductTypeId);
    if(productObject.AdminComment) productObject["AdminComment"] = this.stringAttribute(productObject.AdminComment);
    if(productObject.ProductTemplateId) productObject["ProductTemplateId"] = this.stringAttribute(productObject.ProductTemplateId);
    
    if(productObject.VendorId) productObject["VendorId"] = this.stringAttribute(productObject.VendorId);
    if(productObject.ShowOnHomePage) productObject["ShowOnHomePage"] = this.booleanAttribute(productObject.ShowOnHomePage);
    if(productObject.MetaKeywords) productObject["MetaKeywords"] = this.stringAttribute(productObject.MetaKeywords);
    if(productObject.MetaDescription) productObject["MetaDescription"] = this.stringAttribute(productObject.MetaDescription);
    if(productObject.MetaTitle) productObject["MetaTitle"] = this.stringAttribute(productObject.MetaTitle);
      
    if(productObject.AllowCustomerReviews) productObject["AllowCustomerReviews"] = this.booleanAttribute(productObject.AllowCustomerReviews);
    if(productObject.ApprovedRatingSum) productObject["ApprovedRatingSum"] = this.integerAttribute(productObject.ApprovedRatingSum);
    if(productObject.NotApprovedRatingSum) productObject["NotApprovedRatingSum"] = this.integerAttribute(productObject.NotApprovedRatingSum);
    if(productObject.ApprovedTotalReviews) productObject["ApprovedTotalReviews"] = this.integerAttribute(productObject.ApprovedTotalReviews);
    if(productObject.NotApprovedTotalReviews) productObject["NotApprovedTotalReviews"] = this.integerAttribute(productObject.NotApprovedTotalReviews);
    if(productObject.SubjectToAcl) productObject["SubjectToAcl"] = this.booleanAttribute(productObject.SubjectToAcl);
    if(productObject.CustomerRoles) productObject["CustomerRoles"] = this.arrayAttribute(productObject.CustomerRoles);
    if(productObject.LimitedToStores) productObject["LimitedToStores"] = this.booleanAttribute(productObject.LimitedToStores);
      
    if(productObject.Stores) productObject["Stores"] = this.arrayAttribute(productObject.Stores);
    if(productObject.ExternalId) productObject["ExternalId"] = this.stringAttribute(productObject.ExternalId);
    if(productObject.Sku) productObject["Sku"] = this.stringAttribute(productObject.Sku);
    if(productObject.ManufacturerPartNumber) productObject["ManufacturerPartNumber"] = this.stringAttribute(productObject.ManufacturerPartNumber);
    if(productObject.Gtin) productObject["Gtin"] = this.stringAttribute(productObject.Gtin);
    if(productObject.IsGiftCard) productObject["IsGiftCard"] = this.booleanAttribute(productObject.IsGiftCard);
    if(productObject.GiftCardTypeId) productObject["GiftCardTypeId"] = this.integerAttribute(productObject.GiftCardTypeId);
    if(productObject.OverriddenGiftCardAmount) productObject["OverriddenGiftCardAmount"] = this.integerAttribute(productObject.OverriddenGiftCardAmount);
    if(productObject.RequireOtherProducts) productObject["RequireOtherProducts"] = this.booleanAttribute(productObject.RequireOtherProducts);
    if(productObject.RequiredProductIds) productObject["RequiredProductIds"] = this.stringAttribute(productObject.RequiredProductIds);
    if(productObject.AutomaticallyAddRequiredProducts) productObject["AutomaticallyAddRequiredProducts"] = this.booleanAttribute(productObject.AutomaticallyAddRequiredProducts);
      
    if(productObject.IsDownload) productObject["IsDownload"] = this.booleanAttribute(productObject.IsDownload);
    if(productObject.DownloadId) productObject["DownloadId"] = this.stringAttribute(productObject.DownloadId);
    if(productObject.UnlimitedDownloads) productObject["UnlimitedDownloads"] = this.booleanAttribute(productObject.UnlimitedDownloads);
    if(productObject.MaxNumberOfDownloads) productObject["MaxNumberOfDownloads"] = this.integerAttribute(productObject.MaxNumberOfDownloads);
    if(productObject.DownloadExpirationDays) productObject["DownloadExpirationDays"] = this.integerAttribute(productObject.DownloadExpirationDays);
    if(productObject.DownloadActivationTypeId) productObject["DownloadActivationTypeId"] = this.integerAttribute(productObject.DownloadActivationTypeId);
    if(productObject.HasSampleDownload) productObject["HasSampleDownload"] = this.booleanAttribute(productObject.HasSampleDownload);
    if(productObject.SampleDownloadId) productObject["SampleDownloadId"] = this.stringAttribute(productObject.SampleDownloadId);
    if(productObject.HasUserAgreement) productObject["HasUserAgreement"] = this.booleanAttribute(productObject.HasUserAgreement);
    if(productObject.UserAgreementText) productObject["UserAgreementText"] = this.stringAttribute(productObject.UserAgreementText);
    if(productObject.IsRecurring) productObject["IsRecurring"] = this.booleanAttribute(productObject.IsRecurring);
    if(productObject.RecurringCycleLength) productObject["RecurringCycleLength"] = this.integerAttribute(productObject.RecurringCycleLength);
    if(productObject.RecurringCyclePeriodId) productObject["RecurringCyclePeriodId"] = this.integerAttribute(productObject.RecurringCyclePeriodId);
    if(productObject.RecurringTotalCycles) productObject["RecurringTotalCycles"] = this.integerAttribute(productObject.RecurringTotalCycles);
    if(productObject.IncBothDate) productObject["IncBothDate"] = this.booleanAttribute(productObject.IncBothDate);
    if(productObject.Interval) productObject["Interval"] = this.integerAttribute(productObject.Interval);
    if(productObject.IntervalUnitId) productObject["IntervalUnitId"] = this.integerAttribute(productObject.IntervalUnitId);
      
    if(productObject.Flag) productObject["Flag"] = this.stringAttribute(productObject.Flag);

    if(productObject.IsShipEnabled) productObject["IsShipEnabled"] = this.booleanAttribute(productObject.IsShipEnabled);
    if(productObject.IsFreeShipping) productObject["IsFreeShipping"] = this.booleanAttribute(productObject.IsFreeShipping);
    if(productObject.ShipSeparately) productObject["ShipSeparately"] = this.booleanAttribute(productObject.ShipSeparately);
    if(productObject.AdditionalShippingCharge) productObject["AdditionalShippingCharge"] = this.integerAttribute(productObject.AdditionalShippingCharge);
    if(productObject.DeliveryDateId) productObject["DeliveryDateId"] = this.stringAttribute(productObject.DeliveryDateId);
    if(productObject.IsTaxExempt) productObject["IsTaxExempt"] = this.booleanAttribute(productObject.IsTaxExempt);
    if(productObject.TaxCategoryId) productObject["TaxCategoryId"] = this.stringAttribute(productObject.TaxCategoryId);
    if(productObject.IsTele) productObject["IsTele"] = this.booleanAttribute(productObject.IsTele);
    if(productObject.ManageInventoryMethodId) productObject["ManageInventoryMethodId"] = this.integerAttribute(productObject.ManageInventoryMethodId);
    if(productObject.UseMultipleWarehouses) productObject["UseMultipleWarehouses"] = this.booleanAttribute(productObject.UseMultipleWarehouses);
    if(productObject.WarehouseId) productObject["WarehouseId"] = this.stringAttribute(productObject.WarehouseId);
    if(productObject.StockQuantity) productObject["StockQuantity"] = this.integerAttribute(productObject.StockQuantity);
    if(productObject.DisplayStockAvailability) productObject["DisplayStockAvailability"] = this.booleanAttribute(productObject.DisplayStockAvailability);
    if(productObject.DisplayStockQuantity) productObject["DisplayStockQuantity"] = this.booleanAttribute(productObject.DisplayStockQuantity);
    if(productObject.MinStockQuantity) productObject["MinStockQuantity"] = this.integerAttribute(productObject.MinStockQuantity);
    if(productObject.LowStock) productObject["LowStock"] = this.booleanAttribute(productObject.LowStock);
    if(productObject.LowStockActivityId) productObject["LowStockActivityId"] = this.integerAttribute(productObject.LowStockActivityId);
      
    if(productObject.NotifyAdminForQuantityBelow) productObject["NotifyAdminForQuantityBelow"] = this.integerAttribute(productObject.NotifyAdminForQuantityBelow);
    if(productObject.BackorderModeId) productObject["BackorderModeId"] = this.integerAttribute(productObject.BackorderModeId);
    if(productObject.AllowBackInStockSubscriptions) productObject["AllowBackInStockSubscriptions"] = this.booleanAttribute(productObject.AllowBackInStockSubscriptions);
    if(productObject.OrderMinimumQuantity) productObject["OrderMinimumQuantity"] = this.integerAttribute(productObject.OrderMinimumQuantity);
    if(productObject.OrderMaximumQuantity) productObject["OrderMaximumQuantity"] = this.integerAttribute(productObject.OrderMaximumQuantity);
    if(productObject.AllowedQuantities) productObject["AllowedQuantities"] = this.stringAttribute(productObject.AllowedQuantities);
    if(productObject.AllowAddingOnlyExistingAttributeCombinations) productObject["AllowAddingOnlyExistingAttributeCombinations"] = this.booleanAttribute(productObject.AllowAddingOnlyExistingAttributeCombinations);
    if(productObject.NotReturnable) productObject["NotReturnable"] = this.booleanAttribute(productObject.NotReturnable);
    if(productObject.DisableBuyButton) productObject["DisableBuyButton"] = this.booleanAttribute(productObject.DisableBuyButton);
    if(productObject.DisableWishlistButton) productObject["DisableWishlistButton"] = this.booleanAttribute(productObject.DisableWishlistButton);
    if(productObject.AvailableForPreOrder) productObject["AvailableForPreOrder"] = this.booleanAttribute(productObject.AvailableForPreOrder);
    if(productObject.PreOrderAvailabilityStartDateTimeUtc) productObject["PreOrderAvailabilityStartDateTimeUtc"] = this.integerNullAttribute(productObject.PreOrderAvailabilityStartDateTimeUtc);
    if(productObject.CallForPrice) productObject["CallForPrice"] = this.booleanAttribute(productObject.CallForPrice);
    if(productObject.Price) productObject["Price"] = this.integerAttribute(productObject.Price);
    if(productObject.CatalogPrice) productObject["CatalogPrice"] = this.integerAttribute(productObject.CatalogPrice);
    if(productObject.OldPrice) productObject["OldPrice"] = this.integerAttribute(productObject.OldPrice);
    if(productObject.ProductCost) productObject["ProductCost"] = this.integerAttribute(productObject.ProductCost);
    
    if(productObject.CustomerEntersPrice) productObject["CustomerEntersPrice"] = this.booleanAttribute(productObject.CustomerEntersPrice);
    if(productObject.MinimumCustomerEnteredPrice) productObject["MinimumCustomerEnteredPrice"] = this.integerAttribute(productObject.MinimumCustomerEnteredPrice);
    if(productObject.MaximumCustomerEnteredPrice) productObject["MaximumCustomerEnteredPrice"] = this.integerAttribute(productObject.MaximumCustomerEnteredPrice);
    if(productObject.BasepriceEnabled) productObject["BasepriceEnabled"] = this.booleanAttribute(productObject.BasepriceEnabled);
    if(productObject.BasepriceAmount) productObject["BasepriceAmount"] = this.integerAttribute(productObject.BasepriceAmount);
    if(productObject.BasepriceUnitId) productObject["BasepriceUnitId"] = this.stringAttribute(productObject.BasepriceUnitId);
    if(productObject.BasepriceBaseAmount) productObject["BasepriceBaseAmount"] = this.integerAttribute(productObject.BasepriceBaseAmount);
    if(productObject.BasepriceBaseUnitId) productObject["BasepriceBaseUnitId"] = this.stringAttribute(productObject.BasepriceBaseUnitId);
    if(productObject.UnitId) productObject["UnitId"] = this.stringAttribute(productObject.UnitId);
    if(productObject.CourseId) productObject["CourseId"] = this.stringAttribute(productObject.CourseId);
    if(productObject.MarkAsNew) productObject["MarkAsNew"] = this.booleanAttribute(productObject.MarkAsNew);
    if(productObject.MarkAsNewStartDateTimeUtc) productObject["MarkAsNewStartDateTimeUtc"] = this.integerNullAttribute(productObject.MarkAsNewStartDateTimeUtc);
    if(productObject.MarkAsNewEndDateTimeUtc) productObject["MarkAsNewEndDateTimeUtc"] = this.integerNullAttribute(productObject.MarkAsNewEndDateTimeUtc);
    if(productObject.Weight) productObject["Weight"] = this.integerAttribute(productObject.Weight);
    if(productObject.Length) productObject["Length"] = this.integerAttribute(productObject.Length);
    if(productObject.Width) productObject["Width"] = this.integerAttribute(productObject.Width);
    if(productObject.Height) productObject["Height"] = this.integerAttribute(productObject.Height);
      
    
    if(productObject.StartPrice) productObject["StartPrice"] = this.integerAttribute(productObject.StartPrice);
    if(productObject.HighestBid) productObject["HighestBid"] = this.integerAttribute(productObject.HighestBid);
    if(productObject.HighestBidder) productObject["HighestBidder"] = this.stringAttribute(productObject.HighestBidder);
    if(productObject.AuctionEnded) productObject["AuctionEnded"] = this.booleanAttribute(productObject.AuctionEnded);
    if(productObject.DisplayOrder) productObject["DisplayOrder"] = this.integerAttribute(productObject.DisplayOrder);
    if(productObject.DisplayOrderCategory) productObject["DisplayOrderCategory"] = this.integerAttribute(productObject.DisplayOrderCategory);
    if(productObject.DisplayOrderManufacturer) productObject["DisplayOrderManufacturer"] = this.integerAttribute(productObject.DisplayOrderManufacturer);
    
    if(productObject.AvailableStartDateTimeUtc) productObject["AvailableStartDateTimeUtc"] = this.stringAttribute(productObject.AvailableStartDateTimeUtc);
    if(productObject.AvailableEndDateTimeUtc) productObject["AvailableEndDateTimeUtc"] = this.stringAttribute(productObject.AvailableEndDateTimeUtc);
    if(productObject.ProductTags) productObject["ProductTags"] = this.arrayAttribute(productObject.ProductTags);
    if(productObject.ProductCategories) productObject["ProductCategories"] = this.arrayAttribute(productObject.ProductCategories);
    if(productObject.ProductAttributeMappings) productObject["ProductAttributeMappings"] = this.arrayAttribute(productObject.ProductAttributeMappings);
    if(productObject.ProductSpecificationAttributes) productObject["ProductSpecificationAttributes"] = this.arrayAttribute(productObject.ProductSpecificationAttributes);
    if(productObject.ServiceTypes) productObject["ServiceTypes"] = this.arrayAttribute(productObject.ServiceTypes);
    if(productObject.Published) {
      productObject["Published"] = this.booleanAttribute(productObject["Published"]);
    }else{
      productObject["Published"] = false;
    }
    return productObject;
  }

  async createProductUsingStoreId(storeId: string, product: any, res:any, productId:any): Promise<any> {
    
    if (product.AvailableStartDateTimeUtc) {
      product.AvailableStartDateTimeUtc = moment(product.AvailableStartDateTimeUtc).utc().format();
      if(product.AvailableStartDateTimeUtc == "Invalid Date") {
          return res.status(404).send({errors:["Invalid Date"]});
        }
    }
    if (product.AvailableEndDateTimeUtc) {
      product.AvailableEndDateTimeUtc = moment(product.AvailableEndDateTimeUtc).utc().format();
      if(product.AvailableEndDateTimeUtc == "Invalid Date"){
        return res.status(404).send({errors:["Invalid Date"]});
      }
    }

    // product attribute mapping
    if(product.ProductAttributeMappings){
        product = await this.createProductAttributeFunction(product, storeId, res)
      }
  
    // product object
    let productObject: any = await this.productObjectData(product);

    // create product
    if(!productId){
      productObject.CreatedOnUtc= new Date().toISOString();
      productObject.UpdatedOnUtc= new Date().toISOString();
    }
    
    let createProduct = productId ? await InventoryDao.updateProductByStoreIdAndProductId(
      storeId,
      productId,
      productObject
    ):await InventoryDao.createProductUsingCustomerId(
      productObject
    );
    if (createProduct) {
        return createProduct;
    } else {
        return res.status(404).send({errors:['Products does not exists.']})
    }
    }

    async createProductAttributeFunction(product:any, storeId: string, res:any){
        // create product attribute mapping
        let existingProductAttributes = []
        let newProductAttributes = []
        let newProductInsertData = []
        if(product.ProductAttributeMappings){
          existingProductAttributes = product.ProductAttributeMappings.filter((d:any) => d.ProductAttributeId );
          newProductAttributes = product.ProductAttributeMappings.filter((d:any) => !d.ProductAttributeId );
          if(newProductAttributes.length !== 0){
            newProductInsertData = await this.createProductAttributes(storeId, newProductAttributes, res);
          }
          product.ProductAttributeMappings = existingProductAttributes.concat(newProductInsertData);
        }
        return product;
      }

      async createProductAttributes(
        storeId: string,
        bodyData: any,
        res:any
      ){
        let createProductAttributesArray = []
        for (let index = 0; index < bodyData.length; index++) {
          const element = bodyData[index];
          let productAttributesObjectData = {
            _id:uuid(),
            Name:element.Name, 
            GenericAttributes:[{
              "Key": "STOREID",
              "Value": "",
              "StoreId": storeId
          }],
            SeName:element.SeName, 
            IsRequired: element.IsRequired,
            Description:element.Description,
            PredefinedProductAttributeValues:element.ProductAttributeValues
          }
          // let createProductAttributesFinalData = await this.repository.createProductAttributes(productAttributesObjectData);  
          createProductAttributesArray.push(productAttributesObjectData)
        }
        let createProductAttributesFinalData = await InventoryAttributesDao.createProductAttributes(createProductAttributesArray);
        
        let createProductAttributeConvertDate:any = []
        createProductAttributesFinalData.forEach((element:any) => {
          createProductAttributeConvertDate.push({
            ProductAttributeId: element._id,
            Locales: element.Locales,
            Name: element.Name,
            GenericAttributes: element.GenericAttributes,
            SeName: element.SeName,
            Description: element.Description,
            DisplayOrder:0,
            ProductAttributeValues: element.PredefinedProductAttributeValues
          })
        });
        if (createProductAttributeConvertDate) {
          return createProductAttributeConvertDate;
        } else {
            return res.status(404).send({errors:['Product Attribute create  error.']});
        }
      }

      uploadInventoryAssetusingProductId =async (storeId: string, productId: string, imageData: any) => {
        log("Verifying image file.");
        if (!imageData.image) return {status:403, message:{errors:["Please send correct image attribute."]}}
        let imageAllowedMimeTypes = ['image/gif', 'image/jpeg', 'image/pjpeg', 'image/x-png', 'image/png', 'image/svg+xml', 'image/jpg']
        let file = imageAllowedMimeTypes.includes(imageData.image.mimetype)
        if (!file) return {status:403, message:{errors:["Please upload only image."]}}
     
        const PictureData = {
          MimeType: imageData.image.mimetype,
          SeoFilename: path.parse(imageData.image.name).name,
          PictureBinary: imageData.image.data
        }
        
        let insertImageInPictureCollection = await pictureDao.createProductImageDataPictureCollection(PictureData)
        if (!insertImageInPictureCollection) return {status:403, message:{errors:["Insert image error in picture collection."]}}
    
        imageData.PictureId = insertImageInPictureCollection["_id"];
        let findImage:any = false;
        log("Uploading Product Image in S3 bucket." + findImage);
        let UploadedProductImageInS3Bucket = await awsService.uploadProductImageInS3Bucket(
          imageData, productId
        );
        
        if (UploadedProductImageInS3Bucket.statusCode === 403) return {status:403, message:{errors:["S3 Bucket Access Denied."]}}
        
        log("Insert Product Image Data in Picture collection." + insertImageInPictureCollection);
        // const ProductPictureData = {
        UploadedProductImageInS3Bucket["PictureId"]= insertImageInPictureCollection["_id"];
        UploadedProductImageInS3Bucket["MimeType"]= imageData.image.mimetype;
        UploadedProductImageInS3Bucket["SeoFilename"]= path.parse(imageData.image.name).name;
        // }
    
        
    let insertProductAssetData = await InventoryDao.updateAssetData(UploadedProductImageInS3Bucket, productId,storeId, "Image", findImage);
    if (insertProductAssetData && UploadedProductImageInS3Bucket) {
      log("Insert Product Assets Passed.");
      return {status:200, message:{imageUrl:UploadedProductImageInS3Bucket["Location"]}}
    } else {
      return {status:404, message:{errors:["Store Id or ProductId does not exists."]}}
    }
     
  }

  public async updateInventoryImageUsingInventoryIdAndPictureId(
    storeId: string,
    productId: string,
    pictureId: string,
    imageData: any
  ) {
    if (!imageData.image) return {status:403, message:{errors:["Please send correct image attribute."]}}
    log("Verifying image file.");
    let imageAllowedMimeTypes = ['image/gif', 'image/jpeg', 'image/pjpeg', 'image/x-png', 'image/png', 'image/svg+xml']
    let file = imageAllowedMimeTypes.includes(imageData.image.mimetype)
    if (!file) return {status:403, message:{errors:["Please upload only image."]}}

    log("get product images using productId amd pictureId.");
    let getProductImageData = await InventoryDao.findImageByProductIdAndPictureId(productId, pictureId);
    if (!getProductImageData) return {status:404, message:{errors:["No image data found."]}};
      // let findImage = false;
    if(getProductImageData['ProductPictures']){
    if (getProductImageData['ProductPictures']["length"] !== 0) {
        for (const element of getProductImageData["ProductPictures"]){
          log("delte product images using productImage data." + typeof element["MimeType"]);
          let imageDataUrl:any = `${element["PictureId"]}_${element["SeoFilename"]}.${mime.extension(element["MimeType"])}`;
          await awsService.deleteProductImageInS3Bucket(imageDataUrl);
        }
      }
    }

    log("update image data in picture collection");
    const PictureData = {
      GenericAttributes:[],
      MimeType: imageData.image.mimetype,
      SeoFilename: path.parse(imageData.image.name).name,
      PictureBinary: imageData.image.data
    }
    let updateImageInPictureCollection = await pictureDao.updateProductImageDataPictureCollection(PictureData, pictureId)
    if (!updateImageInPictureCollection) return {status:403, message:{errors:["Update image error in picture collection."]}};

    // return updateImageInPictureCollection;
    
    imageData.PictureId = pictureId;
    let findImage = false;
    log("Uploading Product Image in S3 bucket." + findImage);
    let UploadedProductImageInS3Bucket = await awsService.uploadProductImageInS3Bucket(
      imageData, productId
    );
    if (UploadedProductImageInS3Bucket.statusCode === 403) return {status:403, message:{errors:["S3 Bucket Access Denied."]}};
    
    log("Update Product Image Data in Product collection using productId and pictureUd. " + updateImageInPictureCollection);
    // const ProductPictureData = {
      UploadedProductImageInS3Bucket["PictureId"]= pictureId;
      UploadedProductImageInS3Bucket["MimeType"]= imageData.image.mimetype;
      UploadedProductImageInS3Bucket["SeoFilename"]= path.parse(imageData.image.name).name;
    // }
    let insertProductAssetData = await InventoryDao.updateProductImageByStoreIdAndProductId(storeId, productId, UploadedProductImageInS3Bucket, pictureId);
    if (insertProductAssetData && UploadedProductImageInS3Bucket) {
      log("Update Product Assets Passed.");
      return {status:200, message:{imageUrl:UploadedProductImageInS3Bucket["Location"]}};
    } else {
      return {status:404, message:{errors:['Store Id or ProductId does not exists.']}};
    }
  }

  public async deleteProductImage(
    storeId: string,
    productId: string,
    pictureId: string
  ) {
    log("get product images using productId amd pictureId." + storeId);
    let getProductImageData = await InventoryDao.findImageByProductIdAndPictureId(productId, pictureId);
    if (!getProductImageData) return {status:404, message:{errors:["No image data found."]}}
    
      // let findImage = false;
    if(getProductImageData['ProductPictures']){
    if (getProductImageData['ProductPictures']["length"] !== 0) {
        for (const element of getProductImageData["ProductPictures"]){
          log("delete product images using productImage data.");
          await awsService.deleteProductImageInS3Bucket(element["PictureId"]+"_"+element["SeoFilename"]+"."+mime.extension(element["MimeType"]));
        }
      }
    }

    log("delete image data in picture collection" + pictureId);
    let deleteImageInPictureCollection = await pictureDao.deleteByPictureId(pictureId)
    if (!deleteImageInPictureCollection) return {status:403, message:{errors:["delete image error in picture collection."]}};

    log("delete Product Image Data in Product collection using productId and pictureUd." + deleteImageInPictureCollection);
    let deleteProductAssetData = await InventoryDao.deleteAssetsByProductIdAndPictureId(productId, pictureId);
    if (deleteProductAssetData) {
      log("delete Product Assets.");
      return {status:200, message:true};;
    } else {
      return {status:404, message:{errors:["PictureId or ProductId does not exists."]}};
    }
  }
}

export default new InventoryService();


