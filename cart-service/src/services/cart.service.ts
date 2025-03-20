import { CRUD } from '@swiftserve/node-common';
import { CreateAuthClientDto } from '../dto/create.user.dto';
import { PutStoreDto } from '../dto/put.user.dto';
import { PatchStoreDto } from '../dto/patch.user.dto';
import customerDao from '../daos/customer.dao';
import debug from 'debug';
import parser from "fast-xml-parser";
import { parse } from "js2xmlparser";
import moment from 'moment';
// import mime from "mime";
const mime = require('mime');


const log: debug.IDebugger = debug('app:cart-service');


class CartService implements CRUD {
    async create(resource: CreateAuthClientDto) {
        // return StoresDao.addStore(resource);
    }

    async deleteById(id: string) {
        return "data";
    }

    async list(limit: number, page: number) {
        // return StoresDao.getStores(limit, page);
    }

    async patchById(id: string, resource: PatchStoreDto): Promise<any> {
        // return StoresDao.updateStoreById(id, resource);
    }

    async putById(id: string, resource: PutStoreDto): Promise<any> {
        // return StoresDao.updateStoreById(id, resource);
    }

    async updateById(id: string, resource: CreateAuthClientDto): Promise<any> {
        // return AuthClientDao.updateStoreById(id, resource);
    }
    async readById(id: string) {
        return "data"
    }
    async getCustomerCartList(customerId: string, storeId:string, queryData:any) {
        let getCustomerCartList:any = await customerDao.findCustomerUsingCustomerId(customerId, storeId, queryData);
        let orderDetailUsingOrderItems = {"shoppingCartItems":[], "totalCartPrice":0, "totalItems":0}
        let ShoppingCartsData:any = [];
        if(getCustomerCartList){
            ShoppingCartsData = this.xmlToJsonConvertOrderData(getCustomerCartList.ShoppingCartItemsData);
            log("Get cartItemData using storeId.");
            let xmlToJsonParseData = this.getcartItemsData(ShoppingCartsData);
              
            orderDetailUsingOrderItems = this.getOrderDetailsUsingOrderItems(xmlToJsonParseData, getCustomerCartList.ProductsData);
            
        }
        
        if (!ShoppingCartsData) {
          return {status:404, message:{errors:['Get Customer cart list error']}}
          // throw new DocumentNotFoundError(404, "Get Customer cart list error");
        }else{  
          return {status:200, message:orderDetailUsingOrderItems}
        }  
    }

    public xmlToJsonConvertOrderData(shoppingCartItems:any ){
        var options = {
          ignoreAttributes : false,
          attributeNamePrefix : ""
        };
        let shoppingCartIemtsData:any = []
        if(shoppingCartItems !== null){
          shoppingCartItems.forEach((element:any) => {
            if(element.AttributesXml !== undefined){
              shoppingCartIemtsData.push({
                id:element._id,
                storeId:element.StoreId,
                shoppingCartType: element.ShoppingCartType,
                shoppingCartTypeId: element.ShoppingCartTypeId,
                productId:element.ProductId, 
                quantity:element.Quantity === null? null:parseInt(element.Quantity) ,
                createdOnUtc: element.CreatedOnUtc,
                updatedOnUtc: element.UpdatedOnUtc,
                duration: element.Duration,
                additionalComments: element.AdditionalComments,
                orderType: element.OrderType,
                deliveryTime: element.DeliveryTime,
                xmlData:element.AttributesXml === null || element.AttributesXml === ''? []:parser.parse(element.AttributesXml, options)
              });
            }
          });
        }
        return shoppingCartIemtsData;
    }

    public getcartItemsData(ShoppingCartsData:any){
        let xmlToJsonParseData:any = [];
        ShoppingCartsData.forEach((element:any,i:any) => {
          xmlToJsonParseData.push({id:element.id,
            productAttributes:[], 
            shoppingCartType: element.shoppingCartType,
            shoppingCartTypeId: element.shoppingCartTypeId,
            productId:element.productId, 
            quantity:element.quantity === null? null:parseInt(element.quantity) ,
            createdOnUtc: element.createdOnUtc,
            updatedOnUtc: element.updatedOnUtc,
            duration: element.duration,
            additionalComments: element.additionalComments,
            orderType: element.orderType,
            deliveryTime: element.deliveryTime,
            storeId: element.storeId
          });
    
          
          if(element.xmlData.Attributes !== undefined || element.xmlData.Attributes !== ''){
            if(element.xmlData.Attributes !== undefined){
              if(element.xmlData.Attributes.ProductAttribute !== undefined){
                if(element.xmlData.Attributes.ProductAttribute.length !== undefined){
                  element.xmlData.Attributes.ProductAttribute.forEach(item => {
                    xmlToJsonParseData[i]['productAttributes'].push(item)
                  });
                }else{
                  if(element.xmlData.Attributes.ProductAttribute.ProductAttributeValue !== undefined){
                    xmlToJsonParseData[i]['productAttributes'].push({ID:element.xmlData.Attributes.ProductAttribute.ID,ProductAttributeValue:element.xmlData.Attributes.ProductAttribute.ProductAttributeValue})
                  }
                }
              }
            }
          }
        });
        return xmlToJsonParseData;
      }

      public getOrderDetailsUsingOrderItems(xmlToJsonParseData:any,productData:any ){
        log("Passing xml to json convert data and productData");
        let finalData:any = [];
        var totalCartPrice = 0;
        var totalItems = 0;
        xmlToJsonParseData.forEach((element:any) => {
          productData.filter((product1:any) => {
            if(product1["_id"] === element.productId){
              let Data1:any = [];
              var myTotal = 0;
              element.productAttributes.forEach(attributeId => {
                product1.ProductAttributeMappings.filter(productAttributeId => {
                  // ProductAttributes
                  let AttributeName = product1.ProductAttributes.filter(productAttributeName=> productAttributeName["_id"] === productAttributeId.ProductAttributeId)[0]["Name"];
                  productAttributeId.ProductAttributeName = AttributeName=== undefined?"":AttributeName;
                  if(attributeId['ID'] === productAttributeId["_id"]){
                    let data2:any = []
                    Data1.push({
                      "_id":productAttributeId["_id"],
                      "Name":productAttributeId.ProductAttributeName, 
                      "productAttributeValues":data2,
                      "IsRequired":productAttributeId.IsRequired, 
                      "DisplayOrder":productAttributeId.DisplayOrder,
                      "attributeControlTypeId": productAttributeId.AttributeControlTypeId,
                      "name": productAttributeId.ProductAttributeName,
                      "seName": productAttributeId.seName,
                      "externalAttributeId": productAttributeId.externalAttributeId === undefined?null:productAttributeId.externalAttributeId
                    });
                    if(attributeId.ProductAttributeValue.length === undefined){
                      productAttributeId.ProductAttributeValues.forEach(productAttributeValuesData => {
                        if(productAttributeValuesData["_id"] === attributeId.ProductAttributeValue.Value){
                          myTotal += parseFloat(productAttributeValuesData.PriceAdjustment)
                          data2.push(this.getProductAttributeValuesData(productAttributeValuesData)); 
                        }
                      });
                    } else{
                      attributeId.ProductAttributeValue.forEach(attributeProductValues => {
                        productAttributeId.ProductAttributeValues.filter(productattributeValuesData2 => {
                            if(productattributeValuesData2["_id"] === attributeProductValues.Value){
                              myTotal += parseFloat(productattributeValuesData2.PriceAdjustment)
                              data2.push(this.getProductAttributeValuesData(productattributeValuesData2)); 
                            }
                          });
                        });
                    }
                  }
                })
              });
              let pictureData:any = []
              product1.ProductPictures.forEach(productPicture => {
                pictureData.push({ pictureId: productPicture.PictureId, pictureUrl: `${process.env.assets_base_url}/${productPicture.PictureId}_${productPicture.SeoFilename}.${productPicture.MimeType === "image/jpg"?"jpeg":mime.getExtension(productPicture.MimeType)}` })
                // pictureData.push({ pictureId: productPicture.PictureId, pictureUrl: `${process.env.assets_base_url}/${productPicture.PictureId}_${productPicture.SeoFilename}.${productPicture.MimeType === "image/jpg"?"jpeg":'jpg'}` })
              });
              finalData.push({
                "id": element["id"],
                storeId: element["storeId"],
                shoppingCartTypeId: element["shoppingCartTypeId"],
                productId: element["productId"],
                attributesXml: element["AttributesXml"] === undefined? null: element["AttributesXml"],
                quantity: element["quantity"],
                price: parseFloat(product1["Price"]),
                name: product1["Name"],
                shortDescription: product1["ShortDescription"],
                fullDescription: product1["FullDescription"],
                totalProductPrice: (myTotal + parseFloat(product1["Price"])) * element["quantity"],
                createdOnUtc: element["createdOnUtc"],
                updatedOnUtc: element["updatedOnUtc"],
                shoppingCartType: element["shoppingCartType"],
                duration: element["duration"],
                additionalComments:element["additionalComments"],
                productAttributes:Data1,
                productPictures:pictureData,
                orderType: element["orderType"] === undefined?null:element["orderType"],
                deliveryTime: element["deliveryTime"] === undefined?null:element["deliveryTime"]
              });
              totalCartPrice += (myTotal + parseFloat(product1["Price"])) * element["quantity"];
              totalItems += 1
            }
          })
    
        });
    
        return {"shoppingCartItems":finalData, totalCartPrice:totalCartPrice, totalItems:totalItems};
      }

      public getProductAttributeValuesData(productAttributeValuesData:any ){
        let data:any = {
          "id": productAttributeValuesData._id,
          "name": productAttributeValuesData.Name,
          "priceAdjustment": parseFloat(productAttributeValuesData.PriceAdjustment),
          "cost": parseFloat(productAttributeValuesData.Cost),
          "isPreSelected": productAttributeValuesData.IsPreSelected,
          "displayOrder": parseFloat(productAttributeValuesData.DisplayOrder),
          "externalAttributeId": productAttributeValuesData.externalAttributeId      
        }
        return data;
      }
  
      async createCart(customerId:string, storeId:string, body:any){
        log("Create customer cart");
        let AttributeValues = {}
        if(body.Attributes){
          if(body.Attributes.ProductAttribute !== undefined){
            AttributeValues['ProductAttribute']=[]
            body.Attributes.ProductAttribute.forEach(element => {
              AttributeValues['ProductAttribute'].push({ProductAttributeValue:element['ProductAttributeValue'], ID:{ID:element['ID']}})
            });
          }
        }
        
        // convert Json to xml
        let final = this.ConvertJsonToXml(AttributeValues);
        
        // create cartItem object
        let  createCartItem:any = {
          WarehouseId: null,
          CustomerEnteredPrice: "0",
          RentalStartDateUtc: null,
          RentalEndDateUtc: null,
          Duration : body.Duration === undefined? null:body.Duration,
          Parameter : body.Parameter === undefined? null:body.Parameter,
          ProductId : body.ProductId,
          Quantity : body.Quantity,
          ReservationId : body.ReservationId === undefined? null:body.ReservationId,
          ShoppingCartType : body.ShoppingCartType,
          ShoppingCartTypeId : body.ShoppingCartTypeId,
          StoreId : storeId,
          CreatedOnUtc : moment().utc(),
          UpdatedOnUtc : moment().utc(),
          AdditionalComments : body.AdditionalComments,
          AttributesXml : (body.Attributes == null) ? null : final.split("\n").join("").split("  ").join(""),
          OrderType : body.OrderType === undefined? null:body.OrderType,
          DeliveryTime : body.DeliveryTime === undefined? null:body.DeliveryTime,
          IsFreeShipping: false,
          IsGiftCard: false,
          IsShipEnabled: false,
          AdditionalShippingChargeProduct: '0',
          IsTaxExempt: false,
          IsRecurring: false
        };
    
        // create cartItem using customerId
        let createCustomerCartListId = await customerDao.createShoppingCartItemUsingCustomerId(customerId, createCartItem);
        if (!createCustomerCartListId) {
          return {status:404, message:{errors:["Get Customer cart list error"]}}
        }else{
          return {status:201, message:{cartId:createCustomerCartListId}}
        }
      }

      public ConvertJsonToXml(AttributeValues: any){
        // json parse to xml
        var options1 = {
          declaration:{include:false},
          attributeString:"ID",
          prettyPrinting:{
            indentString:''
          }
        };
        let final = parse("Attributes", AttributeValues, options1);
        return final;
      }

      public async updateCart(customerId:string, storeId:string, itemId: string, body:any){
        log("Update customer cart");
        let AttributeValues:any = {}
        if(body.Attributes){
          if(body.Attributes.ProductAttribute !== undefined){
            AttributeValues['ProductAttribute']=[]
            body.Attributes.ProductAttribute.forEach((element:any) => {
              AttributeValues['ProductAttribute'].push({ProductAttributeValue:element['ProductAttributeValue'], ID:{ID:element['ID']}})
            });
          }
        }
        let final = this.ConvertJsonToXml(AttributeValues);
        // update cartItem object
        let  updateCartItem:any = {
          // "ShoppingCartItems.$.Parameter" : body.Parameter === undefined? null:body.Parameter,
          // "ShoppingCartItems.$.ReservationId" : body.ReservationId === undefined? null:body.ReservationId,
          "ShoppingCartItems.$.StoreId" : storeId,
          "ShoppingCartItems.$.UpdatedOnUtc" : moment().utc(),
          "ShoppingCartItems.$.ProductId": body.ProductId,
          "ShoppingCartItems.$.Quantity": body.Quantity,
          // "ShoppingCartItems.$.DeliveryTime" : body.DeliveryTime === undefined? null:body.DeliveryTime
        };
        if(body.Attributes) updateCartItem["ShoppingCartItems.$.AttributesXml"] = final.split("\n").join("").split("  ").join("");
        if(body.ShoppingCartType) updateCartItem["ShoppingCartItems.$.ShoppingCartType"] = body.ShoppingCartType;
        if(body.ShoppingCartTypeId) updateCartItem["ShoppingCartItems.$.ShoppingCartTypeId"] = body.ShoppingCartTypeId;
        if(body.Duration) updateCartItem["ShoppingCartItems.$.Duration"] = body.Duration;
        if(body.AdditionalComments) updateCartItem["ShoppingCartItems.$.AdditionalComments"] = body.AdditionalComments;
        if(body.OrderType) updateCartItem["ShoppingCartItems.$.OrderType"] = body.OrderType;
    
        // create cartItem using customerId
        let updateCustomerCarItem = await customerDao.updateShoppingCartItemUsingCustomerId(customerId, itemId, updateCartItem);
        if (!updateCustomerCarItem) {
          return {status:404, message:{errors:["updatte cart item error"]}}
        }else{
          return {status:201, message:{cartId:updateCustomerCarItem}}
        }
      }

      public async deleteMyCartitems(
        customerId: string,
        storeId: string,
        cartItemId: string
      ){
        log("Delete shopping CartItem,");
        let deleteCartItemData = await customerDao.deleteCartItemByCustomerIdStoreIdAndCartItemId(
          customerId,
          storeId,
          cartItemId
        );
        if (!deleteCartItemData) {
          return {status:404, message:{errors:["Cartitem does not exists"]}}
        }else{  
          return {status:200, message:{ status: "success" }}
        }
      }
}

export default new CartService();
