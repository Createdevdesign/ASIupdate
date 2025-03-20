import debug from 'debug';
import orderlogDao from '../daos/orderlog.dao';
import parser from "fast-xml-parser";
import productlogDao from '../daos/productlog.dao';
import OrderNoteLogDao from '../daos/orderNotelog.dao';
import storelogDao from '../daos/storelog.dao';
import configurationlogDao from '../daos/configurationlog.dao';
import vonageService from './vonage.service';
import awsemailService from './awsemail.service';
import ordereventlogDao from '../daos/ordereventlog.dao';
import customersessionlogDao from '../daos/customersessionlog.dao';
import firebasenotificationService from './firebasenotification.service';
import paymentService from './payment.service';
import moment from 'moment';
import customerlogDao from '../daos/customerlog.dao';
var unirest = require('unirest');

const log: debug.IDebugger = debug('app:order-controller');

class Orderservice {

    orderListByCustomerId =async (customerId: string,queryData:any,statusArray:any, statusCounts:any) => {
        queryData.statusCounts = statusCounts;
        let orderListData:any = await orderlogDao.findOrdersByCustomerId(customerId, queryData, statusArray);
        return orderListData;
    }
    orderListByStoreId =async (storeId: string,queryData:any,statusArray:any, statusCounts:any) => {
        queryData.statusCounts = statusCounts;
        let orderListData:any = await orderlogDao.findOrdersByStoreId(storeId, queryData, statusArray);
        return orderListData;
    }

    nearByOrderListByCustomerId =async (customerId: string,Latitude:any, Longitude:any) => {
        let nearByorderListData:any = await orderlogDao.findNearbyOrdersByCustomerId(customerId, Latitude,
            Longitude);
        return nearByorderListData;
    }

    
    async getCustomerOrderDetail(customerId:string,orderId: string, res:any) {
        log("Get customer order details.");
        const orders: any = await orderlogDao.findCustomerOrderDetailByOrderId(
          customerId,
          orderId
        );
        if(orders === null || orders === undefined) return res.status(400).send({errors:["No orders found"]});
        let OrderFinalData = await this.getOrderDetailUsingStoreAndCustomerId(orders);
        if (orders) {
          log("Customer order details Passed.");
          return OrderFinalData;
        }
        else {
            return res.status(404).send({errors:["No details found"]});
        }
      }

    async getStoreOrderDetail(storeId:string,orderId: string, res:any) {
        log("Get customer order details.");
        const orders: any = await orderlogDao.findStoreOrderDetailByOrderId(
          orderId,storeId
        );
        if(orders === null || orders === undefined) return res.status(400).send({errors:["No orders found"]});
        let OrderFinalData = await this.getOrderDetailUsingStoreAndCustomerId(orders);
        if (orders) {
          log("Customer order details Passed.");
          return OrderFinalData;
        }
        else {
            return res.status(404).send({errors:["No details found"]});
        }
      }

      async getOrderDetailUsingStoreAndCustomerId(orders:any ){
        log("Xml to json converting data.");
        let OrdersData:any = this.xmlToJsonConvertOrderData(orders);
        log("Get productData and OrderItems using order data.");
        let xmlToJsonParseData:any = [];
        let OrderItemsProductArrayData:any = [];
        OrdersData.forEach((element:any,i:any) => {
          xmlToJsonParseData.push({id:element.id,ProductId:element.ProductId,Quantity:element.Quantity,Pricing:element.Pricing,productAttributeValue:[], AdditionalComments:element.AdditionalComments });
          OrderItemsProductArrayData.push(element.ProductId);
          if(element.xmlData.Attributes !== undefined || element.xmlData.Attributes !== ''){
            if(element.xmlData.Attributes !== undefined){
              if(element.xmlData.Attributes.ProductAttribute !== undefined){
                if(element.xmlData.Attributes.ProductAttribute.length !== undefined){
                  element.xmlData.Attributes.ProductAttribute.forEach((item:any) => {
                    xmlToJsonParseData[i]['productAttributeValue'].push(item)
                  });
                }else{
                  if(element.xmlData.Attributes.ProductAttribute.ProductAttributeValue !== undefined){
                    xmlToJsonParseData[i]['productAttributeValue'].push(element.xmlData.Attributes.ProductAttribute.ProductAttributeValue)
                  }
                }
              }
            }
          }
        });
        
        log("Get product data using product Id.");
        let productData = await productlogDao.OrderItemsProductData(OrderItemsProductArrayData);  
        
        log("get select product items data using xml data and product data.");
        let orderDetailUsingOrderItems = this.getOrderDetailsUsingOrderItems(xmlToJsonParseData, productData);
        return  {...orders, OrderItems:orderDetailUsingOrderItems};
      }
      public xmlToJsonConvertOrderData(orders:any ){
        var options = {
          ignoreAttributes : false,
          attributeNamePrefix : ""
        };
        let OrdersData:any = []
        if(orders !== null){
          orders["OrderItems"][0].forEach((element:any) => {
            if(element.AttributesXml !== undefined){
              OrdersData.push({
                id:element._id,
                ProductId:element.ProductId, 
                Quantity:element.Quantity, 
                Pricing: {
                  "UnitPriceWithoutDiscInclTax": element.UnitPriceWithoutDiscInclTax === undefined?null:parseFloat(element.UnitPriceWithoutDiscInclTax),
                  "UnitPriceWithoutDiscExclTax": element.UnitPriceWithoutDiscExclTax === undefined?null:parseFloat(element.UnitPriceWithoutDiscExclTax),
                  "UnitPriceInclTax": element.UnitPriceInclTax === undefined?null:parseFloat(element.UnitPriceInclTax),
                  "UnitPriceExclTax": element.UnitPriceExclTax === undefined?null:parseFloat(element.UnitPriceExclTax),
                  "PriceInclTax": element.PriceInclTax === undefined?null:parseFloat(element.PriceInclTax),
                  "PriceExclTax": element.PriceExclTax === undefined?null:parseFloat(element.PriceExclTax),
                  "DiscountAmountInclTax": element.DiscountAmountInclTax === undefined?null:parseFloat(element.DiscountAmountInclTax),
                  "DiscountAmountExclTax": element.DiscountAmountExclTax === undefined?null:parseFloat(element.DiscountAmountExclTax),
                  "OriginalProductCost": element.OriginalProductCost === undefined?null:parseFloat(element.OriginalProductCost)
                },
                AdditionalComments:element.AdditionalComments,
                xmlData:element.AttributesXml === null || element.AttributesXml === ''? []:parser.parse(element.AttributesXml, options)
              });
            }
          });
        }
        return OrdersData;
      }

      public getOrderDetailsUsingOrderItems(xmlToJsonParseData:any,productData:any ){
        log("Passing xml to json convert data and productData");
        let finalData:any = [];
        xmlToJsonParseData.forEach((element:any) => {
          productData.filter((product1:any) => {
            if(product1["_id"] === element.ProductId){
              let Data1:any = [];
              finalData.push({"_id": element["id"],
              ProductId: element["ProductId"],
              Quantity: element["Quantity"],
              
              Product:{
                _id: product1["_id"],
                Name: product1["Name"],
                Price: parseFloat(product1["Price"]),
                Attributes: Data1
              },
              AdditionalComments:element["AdditionalComments"]
              // Pricing: element["Pricing"],
              
            });
            element.productAttributeValue.forEach((attributeId:any) => {
              product1.ProductAttributeMappings.filter((productAttributeId:any) => {
                // ProductAttributes
                let AttributeName = product1.ProductAttributes.filter((productAttributeName:any)=> productAttributeName["_id"] === productAttributeId.ProductAttributeId)[0]["Name"];
                productAttributeId.ProductAttributeName = AttributeName=== undefined?"":AttributeName;
                if(attributeId['ID'] === productAttributeId["_id"]){
                  if(attributeId.ProductAttributeValue.length === undefined){
                    productAttributeId.ProductAttributeValues.forEach((productAttributeValuesData:any) => {
                      if(productAttributeValuesData["_id"] === attributeId.ProductAttributeValue.Value){
                        Data1.push(this.getProductAttributeValuesData(productAttributeId, productAttributeValuesData));
                      }
                    });
                  } else{
                    attributeId.ProductAttributeValue.forEach((attributeProductValues:any) => {
                      productAttributeId.ProductAttributeValues.filter((productattributeValuesData2:any) => {
                          if(productattributeValuesData2["_id"] === attributeProductValues.Value){
                            Data1.push(this.getProductAttributeValuesData(productAttributeId, productattributeValuesData2)); 
                          }
                        });
                      });
                  }
                }
              })
            });
            }
          })
        });
  
        return finalData;
      }

      public getProductAttributeValuesData(productAttributeId:any,productAttributeValuesData:any ){
        let data = {
          "_id":productAttributeId["_id"],
          "Name":productAttributeId.ProductAttributeName, 
          "Value":productAttributeValuesData.Name,
          "DisplayOrder":productAttributeValuesData.DisplayOrder,
          "PriceAdjustment":parseFloat(productAttributeValuesData.PriceAdjustment),
          "WeightAdjustment": parseFloat(productAttributeValuesData.WeightAdjustment),
          "Cost": parseFloat(productAttributeValuesData.Cost)
        }
        return data;
      }

      async updateOrderStatus(body:any,storeId:string,orderId:string,customerId:string, res:any) {
        log("updating order status");
        
        var condition:any={}
        const orderStatusCode = await this.convertOrderStatus(body.status);
        switch(body.status) {
          case 'PROCESSING':
            if(orderStatusCode>10 && orderStatusCode<30){
              condition={
                StatusId:orderStatusCode,
                ExpectedTime:this.convertExpectedtimetoHoursmin(body.expectTime),
                Message:body.reason ? body.reason : 'Order status update from CREATED to PROCESSING',
                CreatedBy:customerId,
                Title: "PROCESSING"
               }
            }else{
              return res.status(404).send({errors:[body.status + ' is not found']});
            }
            break;
          case 'READY':
            if(orderStatusCode>20 && orderStatusCode<40){
              condition={
                StatusId:orderStatusCode,
                ExpectedTime:this.convertExpectedtimetoHoursmin(body.expectTime),
                Message:body.reason ? body.reason : 'Order status update from PROCESSING to READY',
                CreatedBy:customerId,
                Title: "READY"
               }
            }else{
              return res.status(404).send({errors:[body.status + ' is not found']});
            }
            break;
            case 'COMPLETE':
              if(orderStatusCode>30 && orderStatusCode<50){
                condition={
                  StatusId:orderStatusCode,
                  ExpectedTime:this.convertExpectedtimetoHoursmin(body.expectTime),
                  Message:body.reason ? body.reason : 'Order status update from READY to COMPLETE',
                  CreatedBy:customerId,
                  Title: "COMPLETE"
                 }
              }else{
                return res.status(404).send({errors:[body.status + ' is not found']});
              }
              break;
          default:
            condition={
              StatusId:orderStatusCode,
              ExpectedTime:this.convertExpectedtimetoHoursmin(body.expectTime),
              Message:body.reason ? body.reason : 'Order Rejected',
              CreatedBy:customerId,
              Title: "CANCELLED"
             }
        }
        
      const orderData:any=  await orderlogDao.findOrderusingCustomerIdAndStoreId(
            orderId,
            storeId,
            condition
      );
      if(!orderData){
        return res.status(404).send({errors:['No order found']});
      }
            
      await OrderNoteLogDao.updateOrderNote(orderId,condition.Message);
      const storeInfo:any=  await storelogDao.findStoreInfoByStoreId(storeId);
                
      const configurationNotificationData: any = await configurationlogDao.ConfigNotificationData("OrderNotification-enabled", orderData.CustomerId)
      log("notification enabled data", configurationNotificationData);
        let ProductData = await this.productConvertData(orderData.OrderItems, orderData);
        var phoneNumber=orderData.AdditionalOrderDetails ? orderData.AdditionalOrderDetails.PhoneNumber :'';
        var templateData=await this.ConvertTemplateData(orderData,storeInfo,body.status);
        var sendAppNotification=await this.SendNotificationData(templateData, condition);
        
        if(configurationNotificationData.configSms && configurationNotificationData.customerPreferenceSms){
          let sendSms:any = await vonageService.sendSms(sendAppNotification.smsMessageData,phoneNumber, res);
          if(sendSms.status !== "0"){
            return res.status(400).send({errors:sendSms});
          }
        }
        
        if(configurationNotificationData.configEmail && configurationNotificationData.customerPreferenceEmail){
          await awsemailService.sendEmailNotification(templateData,orderData.CustomerEmail,'MyTemplate', sendAppNotification.notification_data.title, ProductData);
          await this.creatingEvent(orderData, "CUSTOMER-EMAIL-NOTIFICATION", "Sent Email notificaiton");
        }
        
        if(configurationNotificationData.customerPreferenceNotificaiton){
          if(body.status !== "COMPLETE"){
            const customerNotificationId:any=  await customersessionlogDao.findNotificatoinByOrderCustomerId(
              orderData
              );
            await firebasenotificationService.sendAppNotification(customerNotificationId, sendAppNotification);
            await this.creatingEvent(orderData, "SMS-NOTIFICATION", "Sent notificaiton");
          }
        }
        
        if(body.status == "COMPLETE" && (orderData.PaymentStatus === 10 || orderData.PaymentStatus === 60)){
          await  orderlogDao.updatePaymentStatus(orderId, 60, 60, body.type ? body.type : '');
          await this.creatingEvent(orderData, "ORDER-PAYMENT", "PAYMENNT CAPTURED");
        }
        if(body.status == "CANCELLED" && (orderData.PaymentStatus === 10 || orderData.PaymentStatus === 60)){
          await orderlogDao.updatePaymentStatus(orderId, 60, 60, '');
          await this.creatingEvent(orderData, "ORDER-PAYMENT", "PAYMENNT UNCAPTURED");
        }
        if(body.status == "COMPLETE" && orderData.PaymentStatus > 10 && orderData.PaymentStatus < 30){
          await paymentService.paymentCapture(orderData.StripePaymentId, res);
          await orderlogDao.updatePaymentStatus(orderId, 30, 30,'');
          await this.creatingEvent(orderData, "ORDER-PAYMENT", "PAYMENNT CAPTURED");
        }
        if(body.status == "CANCELLED" && orderData.PaymentStatus !== 40 && orderData.PaymentStatus !== 60 && orderData.PaymentStatus === 30){
          await paymentService.paymentRefund(orderData.StripePaymentId, orderData.OrderNumber, res);
          await orderlogDao.updatePaymentStatus(orderId, 40, 40,'');
          await this.creatingEvent(orderData, "ORDER-PAYMENT", "PAYMENNT REFUNDED");
        }
        await orderlogDao.updateStatus(
          orderId,
          storeId,
          condition
          );
        log(" Store orders Passed.");
      }
    //update order status
    public async convertOrderStatus(statusCode:string){
      log("Converting order status code.");
      let sCode:any;
        if(statusCode=="CREATED"){
          sCode=10;
        }else if(statusCode=="PROCESSING"){
          sCode=20;
        }else if(statusCode=="READY"){
          sCode=30;
        }else if(statusCode=="COMPLETE"){
          sCode=40
        }else if(statusCode=="INVOICED"){
          sCode=50;
        }else if(statusCode=="CANCELLED"){
          sCode=60;
        }
        return sCode;
    
    }

    //update order status
    public convertExpectedtimetoHoursmin(expectedTime:string){
      log("Converting expected time to hours. " + expectedTime);
      let sCode:any;
      if(expectedTime!=undefined){
        let time = expectedTime.split(':')
        sCode=(time[0]=="00"?"":(time[0] + (time[0]==="01"?" hour ":" hours "))) + (time[1]=="00"?"":time[1] + (time[1]=="01"?" minute":" minutes"));
      }
      console.log(sCode + "======================================");
      return sCode;
    
    }

    public async productConvertData(OrderData:any, OrderFinalData:any){
      let OrderItemsProductArrayData:any = [];
      log("Xml to json converting data.", OrderData);
      let OrdersFinalData2:any = this.xmlToJsonConvertOrderData1(OrderFinalData);
      let xmlToJsonParseData:any = [];
        OrdersFinalData2.forEach((element:any,i:any) => {
          xmlToJsonParseData.push({id:element.id,ProductId:element.ProductId,Quantity:element.Quantity,Pricing:element.Pricing,productAttributeValue:[], AdditionalComments:element.AdditionalComments });
          OrderItemsProductArrayData.push(element.ProductId);
        })
  
        
      log("Get product data using product Id.");
      let productData = await productlogDao.OrderItemsProductData(OrderItemsProductArrayData);
  
      let finalData:any = [];
      xmlToJsonParseData.forEach((element:any) => {
        productData.filter((product1:any) => {
          if(product1["_id"] === element.ProductId){
              finalData.push({"_id": element["id"],
              ProductId: element["ProductId"],
              Quantity: element["Quantity"],
              Name: product1["Name"],
              Price: parseFloat(product1["Price"]),
              AdditionalComments:element["AdditionalComments"],
              OrderSubTotal:  parseInt(element["Quantity"])*parseFloat(product1["Price"])
            });
          }
          
        })
      }); 
      return finalData;
    }

    public xmlToJsonConvertOrderData1(orders:any ){
      var options = {
        ignoreAttributes : false,
        attributeNamePrefix : ""
      };
      let OrdersData:any = []
      
      if(orders !== null){
        orders["OrderItems"].forEach((element:any) => {
          if(element.AttributesXml !== undefined){
            OrdersData.push({
              id:element._id,
              ProductId:element.ProductId, 
              Quantity:element.Quantity, 
              Pricing: {
                "UnitPriceWithoutDiscInclTax": element.UnitPriceWithoutDiscInclTax === undefined?null:parseFloat(element.UnitPriceWithoutDiscInclTax),
                "UnitPriceWithoutDiscExclTax": element.UnitPriceWithoutDiscExclTax === undefined?null:parseFloat(element.UnitPriceWithoutDiscExclTax),
                "UnitPriceInclTax": element.UnitPriceInclTax === undefined?null:parseFloat(element.UnitPriceInclTax),
                "UnitPriceExclTax": element.UnitPriceExclTax === undefined?null:parseFloat(element.UnitPriceExclTax),
                "PriceInclTax": element.PriceInclTax === undefined?null:parseFloat(element.PriceInclTax),
                "PriceExclTax": element.PriceExclTax === undefined?null:parseFloat(element.PriceExclTax),
                "DiscountAmountInclTax": element.DiscountAmountInclTax === undefined?null:parseFloat(element.DiscountAmountInclTax),
                "DiscountAmountExclTax": element.DiscountAmountExclTax === undefined?null:parseFloat(element.DiscountAmountExclTax),
                "OriginalProductCost": element.OriginalProductCost === undefined?null:parseFloat(element.OriginalProductCost)
              },
              AdditionalComments:element.AdditionalComments,
              xmlData:element.AttributesXml === null || element.AttributesXml === ''? []:parser.parse(element.AttributesXml, options)
            });
          }
        });
      }
      return OrdersData;
    }

    public async ConvertTemplateData(orderData:any,storeInfo:any,status:string){
      log("assigning email parameters.");
        var templatedata:any={};
        templatedata._id=orderData._id;
        templatedata.name=orderData.FirstName;
        templatedata.customerPhoneNumber=orderData.AdditionalOrderDetails? orderData.AdditionalOrderDetails.PhoneNumber:"";
        templatedata.storeName=storeInfo.storeName;
        templatedata.storeAddress=orderData.AdditionalOrderDetails? orderData.AdditionalOrderDetails.StoreAddress:"";
        templatedata.orderStatus=status;
        templatedata.orderNumber=orderData.OrderNumber;
        templatedata.createdAt=orderData.CreatedOnUtc;
        templatedata.address1=storeInfo.Address ? storeInfo.Address.Address1 :'';
        templatedata.address2=storeInfo.Address ? storeInfo.Address.Address2 :'';
        templatedata.city=storeInfo.Address ? storeInfo.Address.City :'';
        templatedata.state=storeInfo.Address ? storeInfo.Address.StateName :'';
        templatedata.country=storeInfo.Address ? storeInfo.Address.Country :'';
        templatedata.pincode=storeInfo.Address ? storeInfo.Address.ZipPostalCode :'';
        templatedata.userAddress1=orderData.BillingAddress ? orderData.BillingAddress.Address1 :'';
        templatedata.userAddress2=orderData.BillingAddress ? orderData.BillingAddress.Address2 :'';
        templatedata.userCity=orderData.BillingAddress ? orderData.BillingAddress.City :'';
        templatedata.userState=storeInfo.Address ? storeInfo.Address.StateName :'';
        templatedata.userCountry=storeInfo.Address ? storeInfo.Address.Country :'';
        templatedata.userPincode=orderData.BillingAddress ? orderData.BillingAddress.ZipPostalCode :'';
        templatedata.DeliveryType=orderData.DeliveryType;
        templatedata.PrimaryCurrencyCode = orderData.PrimaryCurrencyCode;
        templatedata.OrderTotal = orderData.OrderTotal;
        templatedata.StorePhoneNumber = storeInfo.CompanyPhoneNumber;
        templatedata.StoreEmail = storeInfo.CompanyEmail;
        templatedata.paymentReferenceId=orderData.StripePaymentId;
        templatedata.paymentType=orderData.PaymentType;
        templatedata.orderTax=parseFloat(orderData.OrderTax).toFixed(2);
        templatedata.tipAmount=parseFloat(orderData.TipAmount).toFixed(2);;
        templatedata.orderDiscount= parseFloat(orderData.OrderDiscount).toFixed(2);
      
        return templatedata;
    
    }

    public async SendNotificationData(templateData:any, messageData:any){
      var storeAddress = templateData.storeName + ", " + templateData.address1 + ", " + templateData.address2 + ", " + templateData.city + ", " + templateData.state + ", " + templateData.country + " " + templateData.pincode
      var furtherInformation = ". For order information, reach out to the store. Contact: " + templateData.StorePhoneNumber + ", " + templateData.StoreEmail + ". \n\nRegards,\nSwiftserve Team "
      var notification_data = {
        title: "Order rejected",
        body: "Hi "+ templateData.name + ", we are sorry, we are not able to process the order due to " + messageData.Message + " at " + storeAddress,
        message: "We are sorry to say that your order is cancelled by " 
                  + templateData.storeName 
                  +" due to " 
                  + messageData.Message 
                  + furtherInformation
      }
      if(messageData.Title == "PROCESSING"){
        notification_data = {
          title: "Your order is accepted.",
          body: "Hi "+ templateData.name + ", Thank you for your purchase. Your order will be ready in the next " + messageData.ExpectedTime + " at " + storeAddress, 
          message: "Your order is accepted. Your " + templateData.storeName + " Order # " + templateData.orderNumber +" for "+ templateData.PrimaryCurrencyCode+ " " + templateData.OrderTotal + " is expected to ready in the next " + messageData.ExpectedTime + " at " + storeAddress + furtherInformation,
        }
      }
      if(messageData.Title == "COMPLETE"){
        notification_data = {
          title: "Your order is complete.",
          body: "Hi "+ templateData.name + ", Thank you for your purchase. Your order is done on " + messageData.ExpectedTime + " at " + storeAddress, 
          message:"Your order is delivered. Thank you for using swiftserve app" + furtherInformation
        }
      }
      if(templateData.DeliveryType === "DELIVERY"){
        if(messageData.Title == "READY"){
          notification_data = {
            title: "Your order is READY.",
            body: "Hi "+ templateData.name + ", Your order is ready. Our Delivery person on the way to delivery your order from " + storeAddress, 
            message:"Your order is ready. Our Delivery person on the way to delivery your order at " + storeAddress + furtherInformation
          }
        }
      }else{
        if(messageData.Title == "READY"){
          notification_data = {
            title: "Your order is READY.",
            body: "Hi "+ templateData.name + ", Your order is ready. Please collect your order at " + storeAddress, 
            message: "Your order is ready. Please collect your order at " + storeAddress + furtherInformation
          }
        }
      }
      let notificationData = {
        _id: templateData._id,
        notification_data: notification_data,
        smsMessageData: notification_data.message
      }
      return notificationData
    }

    public async creatingEvent(OrderData:any, EventType:any,EventDetail:any ){
      const EventCheck = await ordereventlogDao.findOrderEvent(OrderData._id);
      const EventData = {
        EventType: EventType,
        OrderNumber: OrderData.OrderNumber,
        EventDetail: EventDetail,
        TriggeredBy: "STORE-Manager",
        CreatedDateOnUtc:new Date().toISOString(),
      }
      if(EventCheck.length){
        await ordereventlogDao.updateOrderEvents(OrderData._id, EventData);
      }else{
        const orderNewEvent:any = {
          type: "ORDER",
          OrderId:OrderData._id,
          CreatedDateOnUtc:new Date().toISOString(),
          Events:[EventData]
        }
        
        await ordereventlogDao.createOrderEvents(orderNewEvent);
      }
      // return data;
    }

    async createCustomerReOrder(customerId:string, storeId:string, orderId:string, headers:any, res:any):Promise<any>{

      let storeHoursFinalData:any = await this.storeHoursApiTrigger(storeId, headers);
      
      if(storeHoursFinalData.status !== 200){
        return res.status(parseInt(storeHoursFinalData.status)).send({errors:[storeHoursFinalData.body === undefined?"":storeHoursFinalData.body.message]});
      }
      log("Create customer reorder", orderId);
      const orders: any = await orderlogDao.findCustomerOrderDetailByOrderId(
        customerId,
        orderId
      );
      if(orders === null || orders === undefined) return res.status(400).send({errors:["No orders found"]});
      
      let finalData:any = [];
      orders.OrderItems[0].forEach((element:any) => {
        let  createCartItem:any = {
          // _id : uuid(),
          WarehouseId: element.WarehouseId,
          CustomerEnteredPrice: element.CustomerEnteredPrice,
          RentalStartDateUtc: element.RentalStartDateUtc,
          RentalEndDateUtc: element.RentalEndDateUtc,
          Duration : element.Duration === undefined? null:element.Duration,
          Parameter : element.Parameter === undefined? null:element.Parameter,
          ProductId : element.ProductId,
          Quantity : element.Quantity,
          ReservationId : element.ReservationId === undefined? null:element.ReservationId,
          ShoppingCartType : 2,
          ShoppingCartTypeId : 5,
          StoreId : storeId,
          CreatedOnUtc : moment().utc(),
          UpdatedOnUtc : moment().utc(),
          AdditionalComments : element.AdditionalComments,
          AttributesXml : element.AttributesXml == null ? null : element.AttributesXml,
          OrderType : element.OrderType === undefined? null:element.OrderType,
          DeliveryTime : element.DeliveryTime === undefined? null:element.DeliveryTime,
          IsFreeShipping: false,
          IsGiftCard: false,
          IsShipEnabled: false,
          AdditionalShippingChargeProduct: '0',
          IsTaxExempt: false,
          IsRecurring: false
        };
        finalData.push(createCartItem);
      })
      // create cartItems using customerId
      let createCustomerCartListId = await customerlogDao.createShoppingCartItemUsingCustomerId(customerId, finalData);
      if (!createCustomerCartListId) {
        return res.status(404).send({errors:["Get Customer cart list error"]});
      }else{
        return storeHoursFinalData?.body?.data;
      }
    }
  
    public async storeHoursApiTrigger(storeId: any, headers:any) {
      log("create user payment intent", storeId);
      let storeHours: any;
  
      try {
        storeHours = await unirest('GET', process.env.api_end_point+`/stores/v1/`+storeId+`/hours`)
          .headers({
            'Content-Type': 'application/json',
            'Authorization': headers.Authorization?headers.Authorization:headers.authorization ,
            'x-timezone':headers["x-timezone"]
          });    
      } catch (err) {
        log("calculate total error", err);
      }
      return storeHours;
    }
}

export default new Orderservice();