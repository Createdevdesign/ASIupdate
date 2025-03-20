import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';
import moment from 'moment';

const log: debug.IDebugger = debug('app:order-dao');
const nearByOrderDistance:any = process.env.nearby_orders_distance_in_meters

class OrderLogDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;

    DeliveryAddressSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId  },
        FirstName: {
          type: String,
        },
        LastName: {
          type: String,
        },
        Email: {
          type: String,
        },
        
        Address1: {
          type: String,
        },
        Address2: {
          type: String,
        },
        City: {
          type: String,
        },
        StateProvinceId: {
          type: String,
        },
        CountryId: {
          type: String,
        },
        ZipPostalCode: {
          type: Number,
        },
        PhoneNumber: {
          type: String,
        },
      
      });
      
      BillingAddressSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId  },
        FirstName: {
          type: String,
        },
        LastName: {
          type: String,
        },
        Email: {
          type: String,
        },
        
        Address1: {
          type: String,
        },
        Address2: {
          type: String,
        },
        City: {
          type: String,
        },
        StateProvinceId: {
          type: String,
        },
        CountryId: {
          type: String,
        },
        ZipPostalCode: {
          type: Number,
        },
        PhoneNumber: {
          type: String,
        },
      
      });
      
      OrderItemSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId  },
        ProductId: {
          type: String,
        },
        Quantity: {
          type: String,
        },
        AttributesXml:{
          type: String,
        }
      
      });
      
      IOrderDataSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId  },
        StatusId: {
          type: String,
        },
        ExpectedTime: {
          type: String,
        },
        Message:{
          type:String
        },
        CreatedOnUtc:{ type: Date, default: moment().utc() },
        CreatedBy:{type:String},
        PaymentType:{type:String}
      });
      IOrderExtraData = new this.Schema({
        PhoneNumber: {
          type: String,
        },
        EmailAddress: {
          type: String,
        },
        StoreName:{
          type:String
        },
        StoreAddress:{type:String}
      
      });
      
      QRCodeDetailSchema = new this.Schema({
        Type: {
          type: String,
        },
        Metadata: {
          type: String,
        },
        DisplayText:{
          type:String
        }
      
      });
      
      OrderLogSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId  },
        OrderNumber:{type:Number},
        Code:{type:String},
        StoreId:{type:String},
        CustomerId:{type:String},
        OrderStatusId:{type:Number},
        ShippingStatusId:{type:Number},
        PaymentStatusId:{type:Number},
        PaymentStatus:{type:Number},
        PaymentMethodSystemName:{type:String},
        CustomerCurrencyCode:{type:String},
        StripePaymentId:{type:String},
        FirstName: {
          type: String,
        },
        LastName: {
          type: String,
        },
        CustomerEmail: {
          type: String,
        },
        PaymentType: {
          type: String,
        },
        PrimaryCurrencyCode: {
          type: String,
        },
        OrderSubtotalInclTax:{
          type:String
        },
        OrderDiscount: {
          type: String,
        },
        OrderTotal: {
          type: String,
        },
        OrderTax: {
          type: String,
        },
        TipAmount: {
          type: String,
        },
        DeliveryType: {
          type: String,
        },
        DeliveryTime: {
          type: String,
        },
        DeliveryFees: {
          type: String,
        },
        Deleted: {
          type: Boolean,
        },
       CreatedOnUtc: { type: Date, default: moment().utc() },
       BillingAddress:this.BillingAddressSchema,
       QRCodeDetails:this.QRCodeDetailSchema,
       DeliveryAddress:this.DeliveryAddressSchema,
        OrderItems :[this.OrderItemSchema],
        OrderStatusHistory:[this.IOrderDataSchema],
        AdditionalOrderDetails:this.IOrderExtraData
      });
      

      Order = mongooseService.getMongoose().model('Order', this.OrderLogSchema, 'Order');
    
    constructor() {
        log('Created new instance of AuthLogDao');
        mongooseService.getMongoose().set('debug', true);
    }
    
    async findOrdersByCustomerId(
      customerId: string,
      queryData: any,
      statusArray: any
    ) {
      log("Fetching Orders by Customer Id.");
      let paginationData:any =  []
      let Page = 1;
      if(queryData.page && queryData.limit){
        Page = parseInt(queryData.page);
        const Limit = parseInt(queryData.limit);
        var Offset: number = (Page - 1) * Limit;
        paginationData =  [ { $skip: Offset }, { $limit: Limit } ]
      }
      let filter: any = { CustomerId: customerId };
      if (statusArray) {
        const orderStatusArray: any = this.convertOrderStatusArray(statusArray);
        filter["OrderStatusId"] = { $in: orderStatusArray };
        // filter = { CustomerId: customerId, OrderStatusId: { $in: orderStatusArray } };
      }
      if (queryData.orderId) {
        filter["OrderNumber"] = parseInt(queryData.orderId);
        // filter = { CustomerId: customerId, OrderNumber: parseInt(queryData.orderId) };
      }
      // if (statusArray && queryData.orderId) {
      //   const orderStatusArray: any = this.convertOrderStatusArray(statusArray);
      //   filter = { CustomerId: customerId, OrderStatusId: { $in: orderStatusArray }, OrderNumber: queryData.orderId };
      // }
      // if (statusArray && queryData.name) {
      //   const orderStatusArray: any = this.convertOrderStatusArray(statusArray);
      //   filter = { CustomerId: customerId, OrderStatusId: { $in: orderStatusArray }, FirstName: queryData.name };
      // }
      if (queryData.name) {
        filter["FirstName"] = queryData.name;
        // filter = { CustomerId: customerId, FirstName: queryData.name };
      }
      if (queryData.dateFrom && queryData.dateTo) {
        filter["CreatedOnUtc"] = { $gte: queryData.dateFrom.toISOString(), $lt: queryData.dateTo.toISOString() };
        // filter = { CustomerId: customerId, CreatedOnUtc: { $gte: queryData.dateFrom.toISOString(), $lt: queryData.dateTo.toISOString() } };
      }
      const orders: any = await this.Order.aggregate([
        { $match: filter },
        { $sort: { "CreatedOnUtc": -1 } },
        {
          $lookup: {
            from: 'Store', localField: 'StoreId',
            foreignField: '_id', as: 'Stores'
          }
        },
        {
          $lookup: {
            from: 'Country', localField: 'DeliveryAddress.CountryId',
            foreignField: '_id', as: 'Country'
          }
        },
        {
          $lookup: {
            from: 'StateProvince', localField: 'DeliveryAddress.StateProvinceId',
            foreignField: '_id', as: 'State'
          }
        },
        {
          $addFields: {
            "StoreId":  { $arrayElemAt: ["$Stores._id",0]},
            "StoreName":  { $arrayElemAt: ["$Stores.Name",0]},
            "StorePhoneNumber": { $arrayElemAt: ["$Stores.CompanyPhoneNumber",0]},
            "DeliveryAddress.Country": { $arrayElemAt: ["$Country.Name", 0] },
            "DeliveryAddress.State": { $arrayElemAt: ["$State.Name", 0] },
            "StoreAddress":{ "$concat": 
              [
                { $arrayElemAt: ["$Stores.Address.Address1", 0] },
                ", ", 
                { $arrayElemAt: ["$Stores.Address.Address2", 0] },
                ", ", 
                { $arrayElemAt: ["$Stores.Address.City", 0] },
                ", ", 
                { $arrayElemAt: ["$Stores.Address.State", 0] },
                ", ", 
                { $arrayElemAt: ["$Stores.Address.ZipPostalCode", 0] }
              ]
            },
            // "OrderStatus": this.convertOrderStatusId("$OrderStatusId"),
            "Logo": this.aggregationConditionArrayElseData("$Stores.Configuration.Assets","$Stores.Configuration.Assets.Logo","" ),
          }
        },
        {
          $project: this.aggregationListProjectData()
        },
      ]).facet({
        total: [{ $match: { OrderStatusId:10 } }, { $count: 'total' }],
        data: paginationData // add projection here wish you re-shape the docs
    } ).addFields({
      "total": {
        "$ifNull": [{ "$arrayElemAt": [ "$total.total", 0 ] }, 0]
      },
      "page": Page
      }).exec();
      var results: any = orders?orders[0]:null;
      if(results !== null){
        results.data.forEach((element:any) => {
          element["OrderTotal"] = parseFloat(element["OrderTotal"]).toFixed(2);
          // element["DeliveryTime"] = moment(element['DeliveryTime']).format('MMMM Do YYYY, h:mm:ss a') === "Invalid date"? element["DeliveryTime"]:moment(element['DeliveryTime']).format('LLL');
          element["OrderStatus"] = this.convertOrderStatusId(element.OrderStatusId);
        })
      }
      return results;
    }

    public convertOrderStatusArray(statusArray: any) {
      statusArray.forEach(function (item:any, i:any) {
        if (item == 'CREATED') {
          statusArray[i] = 10;
        } else if (item == 'COMPLETE') {
          statusArray[i] = 40;
        } else if (item == 'INVOICED') {
          statusArray[i] = 50;
        } else if (item == 'CANCELLED') {
          statusArray[i] = 60;
        } else if (item == 'PROCESSING') {
          statusArray[i] = 20;
        } else if (item == 'READY') {
          statusArray[i] = 30;
        }
      });
      return statusArray;
    }

    public aggregationConditionArrayElseData(value: any, elseData:any, thenData:any) {
      let conditionData = {
        $cond: {
          if: { $eq: [ {$ifNull:[{ $arrayElemAt: [value, 0] }, undefined]}, null] },
           then: thenData,
           else: { $arrayElemAt: [elseData, 0] }
        }
      }
      return conditionData;
    }

    public aggregationListProjectData() {
      let projectData = {
        _id: 1,
        OrderNumber: 1,
        FirstName: 1,
        LastName: 1,
        OrderStatusId: 1,
        StoreId:this.aggregationConditionString("$StoreId",""),
        StoreName:this.aggregationConditionString("$StoreName",""),
        StoreAddress: this.aggregationConditionString("$StoreAddress",""),
        StorePhoneNumber: this.aggregationConditionString("$StorePhoneNumber",""),
        OrderTotal: this.aggregationConditionStringConvertingFloat({ $toDouble: "$OrderTotal"},""),
        DeliveryType: {
          $cond: {
            if: { $eq: [ {$ifNull:["$DeliveryType", undefined]}, null] },
             then: "",
             else: {
               $cond: {
                if: { $eq: [ "$DeliveryType", "IN-STORE"] },
                then: "PICKUP-IN-STORE",
                else:"$DeliveryType"
               }
             }
            }
          },
        DeliveryTime: this.aggregationConditionString("$DeliveryTime",""),
        DeliveryAddress: this.aggregationConditionString("$DeliveryAddress",{}),
        "QRCodeDetails.Type": this.aggregationConditionObjectString("$QRCodeDetails","","$QRCodeDetails.Type"),
        "QRCodeDetails.Metadata": this.aggregationConditionObjectString("$QRCodeDetails",null,"$QRCodeDetails.Metadata"),
        "QRCodeDetails.DisplayText": this.aggregationConditionObjectString("$QRCodeDetails","","$QRCodeDetails.DisplayText"),
        CreatedOnUtc: 1,
        Distance:this.aggregationConditionString("$Distance",null),
        Logo:1,
        "CompletedBy": this.aggregationConditionObjectString("$OrderStatusHistory","","$OrderStatusHistory.CreatedOnUtc"),
        "StatusType": this.aggregationConditionObjectStringNestedData("$OrderStatusHistory", "", "$OrderStatusHistory.PaymentType"),
        "Message": this.aggregationConditionObjectString("$OrderStatusHistory","","$OrderStatusHistory.Message"),
        "PaymentStatusId": 1,
        "PaymentStatus": 1,
        "ProductData": this.aggregationConditionObjectString("$AdditionalOrderDetails","","$AdditionalOrderDetails.OrderItems"),
      }
      return projectData;
    }

    public convertOrderStatusId(status: number) {
      let statusName = ""
      if (status == 10) {
        statusName = 'CREATED';
      } else if (status == 40) {
        statusName = 'COMPLETE';
      } else if (status == 50) {
        statusName = 'INVOICED';
      } else if (status == 60) {
        statusName = 'CANCELLED';
      } else if (status == 20) {
        statusName = 'PROCESSING';
      } else if (status == 30) {
        statusName =  'READY';
      }
    return statusName;
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
  public aggregationConditionStringConvertingFloat(value: any, thenData:any) {
    let conditionData = {
      $cond: {
        if: { $eq: [ {$ifNull:[value, undefined]}, null] },
         then: thenData,
        //  else: parseFloat(value).toFixed(2)
         else: value
      }
    }
    return conditionData;
  }

  public aggregationConditionObjectStringNestedData(value: any, thenData:any, elseValue:any) {
    let conditionData = {
      $cond: {
        if: { $eq: [ {$ifNull:[value, undefined]}, null] },
         then: thenData,
         else: {$ifNull:[elseValue, ""]}
      }
    }
    return conditionData;
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

  async findOrdersByStoreId(
    storeId: string,
    queryData: any,
    statusArray: any
  ) {
    log("Fetching Orders by Storer Id.");
    // const Page = queryData.page;
    // const Limit = queryData.limit;
    // var Offset: number = (Page - 1) * Limit;
    let paginationData:any =  []
    let Page = 1;
    if(queryData.page && queryData.limit){
      Page = parseInt(queryData.page);
      const Limit = parseInt(queryData.limit);
      var Offset: number = (Page - 1) * Limit;
      paginationData =  [ { $skip: Offset }, { $limit: Limit } ]
    }
    
    let filter: any = { StoreId: storeId };
    if (statusArray) {
      const orderStatusArray: any = this.convertOrderStatusArray(statusArray);
      filter = { StoreId: storeId, OrderStatusId: { $in: orderStatusArray } };
    }
    if (queryData.orderId) {
      filter = { StoreId: storeId, OrderNumber: parseInt(queryData.orderId) };
    }
    if (queryData.name) {
      filter = { StoreId: storeId, FirstName: {'$regex': queryData.name, $options: 'i'} };
    }
    if (queryData.dateFrom && queryData.dateTo) {
      filter["CreatedOnUtc"] = { $gte: new Date(queryData.dateFrom), $lt: new Date(queryData.dateTo) } ;
    }
    if (statusArray && queryData.orderId) {
      const orderStatusArray: any = this.convertOrderStatusArray(statusArray);
      filter = { StoreId: storeId, OrderStatusId: { $in: orderStatusArray }, OrderNumber: parseInt(queryData.orderId) };
    }
    if (statusArray && queryData.name) {
      const orderStatusArray: any = this.convertOrderStatusArray(statusArray);
      filter = { StoreId: storeId, OrderStatusId: { $in: orderStatusArray }, FirstName: {'$regex': queryData.name, $options: 'i'} };
    }
    let countData = {
      created: [{ $match: { OrderStatusId:10 } }, { $count: 'total' }],
      processing: [{ $match: { OrderStatusId:20 } }, { $count: 'total' }],
      ready: [{ $match: { OrderStatusId:30 } }, { $count: 'total' }],
      cancelled: [{ $match: { OrderStatusId:60 } }, { $count: 'total' }]
    }
    const orders: any = await this.Order.aggregate([
      { $match: filter },
      { $sort: { "CreatedOnUtc": -1 } },
      {
        $lookup: {
          from: 'Store', localField: 'StoreId',
          foreignField: '_id', as: 'Stores'
        }
      },
      {
        $addFields: {
          "StoreName":  { $arrayElemAt: ["$Stores.Name",0]},
          "StorePhoneNumber": { $arrayElemAt: ["$Stores.CompanyPhoneNumber",0]},
          // "StoreAddress": { $arrayElemAt: ["$Stores.CompanyAddress",0]}
          "StoreAddress":{ "$concat": 
            [
              { $arrayElemAt: ["$Stores.Address.Address1", 0] },
              ", ", 
              { $arrayElemAt: ["$Stores.Address.Address2", 0] },
              ", ", 
              { $arrayElemAt: ["$Stores.Address.City", 0] },
              ", ", 
              { $arrayElemAt: ["$Stores.Address.State", 0] },
              ", ", 
              { $arrayElemAt: ["$Stores.Address.ZipPostalCode", 0] }
            ]
          },
          // "OrderStatus": this.convertOrderStatusId("$OrderStatusId"),
          "Logo": this.aggregationConditionArrayElseData("$Stores.Configuration.Assets","$Stores.Configuration.Assets.Logo","" ),
        }
      },
      {
        $project: this.aggregationListProjectData()
      },
    ]).facet({
      // total: [{ $match: {} }, { $count: 'total' }],
      ...countData,
      data: paginationData // add projection here wish you re-shape the docs
    }).addFields({
    "page": Page
    }).project({
      total:[
        this.aggregationArray("CREATED", "$created.total"),
        this.aggregationArray("PROCESSING", "$processing.total"),
        this.aggregationArray("READY", "$ready.total"),
        this.aggregationArray("CANCELLED", "$cancelled.total")
      ],
      data:"$data",
      page:"$page"
    })
    .exec();
    // if(in)
    
    let ordersCount:any = [];
    if(queryData.statusCounts){
      let filterData:any = { StoreId: storeId};
      
      if (queryData.dateFrom && queryData.dateTo) {
        filterData["CreatedOnUtc"] = { $gte: new Date(queryData.dateFrom), $lt: new Date(queryData.dateTo) } ;
      }
      ordersCount = await this.Order.aggregate([
        { $match: filterData },
        { $sort: { "CreatedOnUtc": -1 } },
      ]).facet(countData)
      .project({
        total:[
          this.aggregationArray("CREATED", "$created.total"),
          this.aggregationArray("PROCESSING", "$processing.total"),
          this.aggregationArray("READY", "$ready.total"),
          this.aggregationArray("CANCELLED", "$cancelled.total")
        ]})
      .exec();
    }
    var OrdersCountResult = ordersCount?ordersCount[0]:null;
    var results: any = orders?orders[0]:null;
    if(results !== null){
      // results.total = [];
      if(OrdersCountResult){
        results.total = OrdersCountResult.total;
      }
      // results.total = results.total.filter(item => item.count !== 0);
      results.data.forEach((element:any) => {
        element["OrderTotal"] = parseFloat(element["OrderTotal"]).toFixed(2);
        // element["DeliveryTime"] = moment(element['DeliveryTime']).format('MMMM Do YYYY, h:mm:ss a') === "Invalid date"? element["DeliveryTime"]:moment(element['DeliveryTime']).format('LLL');
        element["OrderStatus"] = this.convertOrderStatusId(element.OrderStatusId);
        element["PaymentStatus"] = this.convertPaymentStatusId(element.PaymentStatusId === undefined?"":element.PaymentStatusId)
      })
    }
    
    return results;
  }

  
  public aggregationArray(status: string, value: string) {
    return {
      status:status,
      count: {
        "$ifNull": [{ "$arrayElemAt": [ value, 0 ] }, 0]
      }
    }
  }

  public convertPaymentStatusId(status: number) {
    let statusName = ""
    if (status == 10) {
      statusName = 'PENDING';
    } else if (status == 20) {
      statusName = 'AUTHORIZED';
    } else if (status == 30) {
      statusName = 'PAID';
    } else if (status == 34) {
      statusName = 'PENDING-PARTIALLY-REFUNDED';
    } else if (status == 35) {
      statusName = 'PARTIALLY-REFUNDED';
    } else if (status == 39) {
      statusName =  'PENDING-REFUNDED';
    }else if (status == 40) {
      statusName =  'REFUNDED';
    }else if (status == 50) {
      statusName =  'VOIDED';
    }else if (status == 60) {
      statusName =  'PAID-AT-STORE';
    }
    return statusName;
  }

  async findNearbyOrdersByCustomerId(
    customerId: string,
    Latitude: any,
    Longitude: any
  ) {
    log("Fetching nearby Orders by Customer Id.");
    
    let filter: any = { CustomerId: customerId, OrderStatusId:{ $in: [10, 20, 30, 50] } };

    const orders: any = await this.Order.aggregate([
      { $match: filter },
      { $sort: { "CreatedOnUtc": -1 } },
      {
        $lookup: {
          from: 'Store', 
          let: { "keywordId": "$StoreId" },
          pipeline: [
            { "$geoNear":{
              near: { type: "Point", coordinates: [parseFloat(Latitude),parseFloat(Longitude)] },
              distanceField: "Distance",
              maxDistance: parseInt(nearByOrderDistance),
              key:"Address.Geometry",
              spherical: true
            } },
            { $match: { $expr: { $eq: ["$_id", "$$keywordId"] } } },
            {
              $addFields: {
                "Distance": this.aggregationConditionString("$Distance", ""),
              }
            },
          ],
          as:"Stores"
        }
      },
      {
        $addFields: {
          "StoreName":  { $arrayElemAt: ["$Stores.Name",0]},
          "StoreAddress": { $arrayElemAt: ["$Stores.CompanyAddress",0]},
          "Distance": { $arrayElemAt: ["$Stores.Distance",0]}
        }
      },
      {
        $project: this.aggregationListProjectData()
      },
    ]).exec();
    const ordersData = await this.checkOrderStatus(orders);
    const data:any = []
    ordersData.forEach((element:any) => {if(element.Distance !== null){
      data.push(element)
    }});
    var results: any = {
      'data': data
    }
    return results;
  }

  public async checkOrderStatus(ordersData: any) {
    let orderInfo: any = ordersData;
    for (var key in orderInfo) {
      if ((orderInfo[key].OrderStatusId) == 10) {
        orderInfo[key].OrderStatusId = "CREATED";

      } else if ((orderInfo[key].OrderStatusId) == 20) {
        orderInfo[key].OrderStatusId = "PROCESSING";

      } else if ((orderInfo[key].OrderStatusId) == 30) {
        orderInfo[key].OrderStatusId = "READY";

      } else if ((orderInfo[key].OrderStatusId) == 40) {
        orderInfo[key].OrderStatusId = "COMPLETE";

      } else if ((orderInfo[key].OrderStatusId) == 50) {
        orderInfo[key].OrderStatusId = "INVOICED ";

      } else {
        orderInfo[key].OrderStatusId = "CANCELLED";

      }
    }
    return orderInfo;
  }

  public orderDetailGroupData() {
    let orderDetailData = {
      "_id": "$_id",
      "OrderNumber": { "$first": "$OrderNumber" },
      "OrderStatusId": { "$first": "$OrderStatusId" },
      "OrderStatus": { "$first": "$OrderStatus" },
      "FirstName": { "$first": "$FirstName" },
      "LastName": { "$first": "$LastName" },
      "PhoneNumber":{ "$first": "$AdditionalOrderDetails.PhoneNumber" },
      "PaymentStatusId": { "$first": "$PaymentStatusId" },
      "PaymentStatus": { "$first": "$PaymentStatus" },
      "PaymentReferenceId": { "$first": "$StripePaymentId" },
      "OrderComment": { "$first": "$OrderComment" },
      "StoreId": { "$first": "$StoreId" },
      "StoreName": { "$first": "$StoreName" },
      "StorePhoneNumber": { "$first": "$StorePhoneNumber" },
      "StoreAddress": { "$first": "$StoreAddress" },
      "orderTotal": { "$first": { $toDouble: "$OrderTotal" } },
      "PickUpInStore": { "$first": "$PickUpInStore" },
      "CustomerEmail": { "$first": "$CustomerEmail" },
      "OrderSubtotalInclTax": { "$first": { $toDouble: "$OrderSubtotalInclTax" } },
      "OrderTax": { "$first": { $toDouble: "$OrderTax" } },
      "OrderDiscount": { "$first": { $toDouble: "$OrderDiscount" } },
      "RefundedAmount": { "$first": { $toDouble: "$RefundedAmount" } },
      "TipAmount": { "$first": { $toDouble: "$TipAmount" } },
      "BillingAddress": { "$first": "$BillingAddress" },
      "DeliveryType": { "$first": {
        $cond: {
          if: { $eq: [ {$ifNull:["$DeliveryType", undefined]}, null] },
           then: "DINE-IN",
           else: {
             $cond: {
              if: { $eq: [ {$ifNull:["$DeliveryType", ""]}, null] },
              then: "DINE-IN",
              else:{
                $cond: {
                 if: { $eq: ["$DeliveryType", "IN-STORE"]},
                 then: "PICKUP-IN-STORE",
                 else:"$DeliveryType"
                }
              }
             }
           }
          }
        } 
      },
      "DeliveryTime": { "$first": "$DeliveryTime" },
      "DeliveryFees": { "$first": "$DeliveryFees" },
      "DeliveryAddress": { "$first": "$DeliveryAddress" },
      "CreatedOnUtc": { "$first": "$CreatedOnUtc" },
      "OrderItems": { "$addToSet": "$OrderItems" },
      "QRCodeDetails": {
        "$first": {
          "Type": this.aggregationConditionObjectString("$QRCodeDetails", "", "$QRCodeDetails.Type"),
          "Metadata": this.aggregationConditionObjectString("$QRCodeDetails", "", "$QRCodeDetails.Metadata"),
          "DisplayText": this.aggregationConditionObjectString("$QRCodeDetails", "", "$QRCodeDetails.DisplayText"),
        }
      },
      "statusUpdatedOnUtc": {"$first":this.aggregationConditionObjectString("$OrderStatusHistory", null, "$OrderStatusHistory.CreatedOnUtc")},
      "statusUpdatedMessage": {"$first":this.aggregationConditionObjectString("$OrderStatusHistory", "", "$OrderStatusHistory.Message")},
      "statusType": {"$first":this.aggregationConditionObjectString("$OrderStatusHistory", null, "$OrderStatusHistory.PaymentType")}
    }

    return orderDetailData;
  }

  async findCustomerOrderDetailByOrderId(
    customerId: string,
    orderId: string
  ) {
    log("Fetching  customer Order detail by order Id.");
    const orderInfo: any = await this.Order.aggregate([
      { $match: { _id: orderId, CustomerId: customerId } },
      {
        $lookup: {
          from: 'Country', localField: 'BillingAddress.CountryId',
          foreignField: '_id', as: 'Country'
        }
      },
      {
        $lookup: {
          from: 'StateProvince', localField: 'BillingAddress.StateProvinceId',
          foreignField: '_id', as: 'State'
        }
      },
      
      {
        $lookup: {
          from: 'Store', localField: 'StoreId',
          foreignField: '_id', as: 'Stores'
        }
      },
      {
        $addFields: {
          "BillingAddress.Country": { $arrayElemAt: ["$Country.Name", 0] },
          "BillingAddress.State": { $arrayElemAt: ["$State.Name", 0] },
          "StoreName": { $arrayElemAt: ["$Stores.Name", 0] },
          "StorePhoneNumber": { $arrayElemAt: ["$Stores.CompanyPhoneNumber",0]},
          // "StoreAddress": { $arrayElemAt: ["$Stores.CompanyAddress", 0] },
          "StoreAddress": { "$concat": 
            [
              { $arrayElemAt: ["$Stores.Address.Address1", 0] },
              ", ", 
              { $arrayElemAt: ["$Stores.Address.Address2", 0] },
              ", ", 
              { $arrayElemAt: ["$Stores.Address.City", 0] },
              ", ", 
              { $arrayElemAt: ["$Stores.Address.State", 0] },
              ", ", 
              { $arrayElemAt: ["$Stores.Address.ZipPostalCode", 0] }
            ]
          },
        }
      },
      {
        $project:{
          "BillingAddress.GenericAttributes":0
        }
      },
      {
        $group: this.orderDetailGroupData()
      },
    ]).exec();

    let OrderInfoData = orderInfo[0] === undefined ? null : orderInfo[0];

    if (OrderInfoData !== null) {
      OrderInfoData.OrderStatus = this.convertOrderStatusId(OrderInfoData.OrderStatusId === undefined?"":OrderInfoData.OrderStatusId);
      delete OrderInfoData.OrderStatusId;
      // OrderInfoData["DeliveryTime"] = moment(OrderInfoData['DeliveryTime']).format('MMMM Do YYYY, h:mm:ss a') === "Invalid date"? OrderInfoData["DeliveryTime"]:moment(OrderInfoData['DeliveryTime']).format('LLL');
      OrderInfoData.PaymentStatus = this.convertPaymentStatusId(OrderInfoData.PaymentStatusId === undefined?"":OrderInfoData.PaymentStatusId);
    }
    let orderInfoFinalData = OrderInfoData === null ?
      undefined
      :
      {
        ...OrderInfoData,
        BillingAddress: {
          ...OrderInfoData.BillingAddress,
          Country: OrderInfoData.BillingAddress.Country === undefined ? "" : OrderInfoData.BillingAddress.Country,
          State: OrderInfoData.BillingAddress.State === undefined ? "" : OrderInfoData.BillingAddress.State
        },
      }
    return orderInfoFinalData;
  }

  async findStoreOrderDetailByOrderId(
    orderId: string,
    storeId: string,
  ) {
    log("Fetching  store Order detail by order Id.");
    
    const orderInfo: any = await this.Order.aggregate([
      { $match: { _id: orderId, StoreId: storeId } },
      {
        $lookup: {
          from: 'Country', localField: 'BillingAddress.CountryId',
          foreignField: '_id', as: 'Country'
        }
      },
      {
        $lookup: {
          from: 'StateProvince', localField: 'BillingAddress.StateProvinceId',
          foreignField: '_id', as: 'State'
        }
      },
      {
        $lookup: {
          from: 'Store', localField: 'StoreId',
          foreignField: '_id', as: 'Stores'
        }
      },
      {
        $addFields: {
          "BillingAddress.Country": { $arrayElemAt: ["$Country.Name", 0] },
          "BillingAddress.State": { $arrayElemAt: ["$State.Name", 0] },
          "StoreName": { $arrayElemAt: ["$Stores.Name", 0] },
          "StorePhoneNumber": { $arrayElemAt: ["$Stores.CompanyPhoneNumber",0]},
          // "StoreAddress": { $arrayElemAt: ["$Stores.CompanyAddress", 0] },
          "StoreAddress": { "$concat": 
            [
              { $arrayElemAt: ["$Stores.Address.Address1", 0] },
              ", ", 
              { $arrayElemAt: ["$Stores.Address.Address2", 0] },
              ", ", 
              { $arrayElemAt: ["$Stores.Address.City", 0] },
              ", ", 
              { $arrayElemAt: ["$Stores.Address.State", 0] },
              ", ", 
              { $arrayElemAt: ["$Stores.Address.ZipPostalCode", 0] }
            ]
          },
        }
      },
      {
        $project:{
          "BillingAddress.GenericAttributes":0
        }
      },
      {
        $group: this.orderDetailGroupData()
      },
    ]).exec();

    let OrderInfoData = orderInfo[0] === undefined ? null : orderInfo[0];

    if (OrderInfoData !== null) {
      OrderInfoData.OrderStatus = this.convertOrderStatusId(OrderInfoData.OrderStatusId === undefined?"":OrderInfoData.OrderStatusId)
      delete OrderInfoData.OrderStatusId
      // OrderInfoData["DeliveryTime"] = moment(OrderInfoData['DeliveryTime']).format('MMMM Do YYYY, h:mm:ss a') === "Invalid date"? OrderInfoData["DeliveryTime"]:moment(OrderInfoData['DeliveryTime']).format('LLL');
      OrderInfoData.PaymentStatus = this.convertPaymentStatusId(OrderInfoData.PaymentStatusId === undefined?"":OrderInfoData.PaymentStatusId)
    }
    let orderInfoFinalData = OrderInfoData === null ?
      undefined
      :
      {
        ...OrderInfoData,
        BillingAddress: {
          ...OrderInfoData.BillingAddress,
          Country: OrderInfoData.BillingAddress.Country === undefined ? "" : OrderInfoData.BillingAddress.Country,
          State: OrderInfoData.BillingAddress.State === undefined ? "" : OrderInfoData.BillingAddress.State
        },
      }
    return orderInfoFinalData;
  }

  // update order status
  async findOrderusingCustomerIdAndStoreId(
    orderId: string,
    storeId: string,
    condition: any
  ) {
    log("find order Status Condition: " + condition);
   const orderData= await this.Order.findOne({ StoreId: storeId, _id: orderId }).exec();
  return orderData;
  }

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: number,
    paymentStatusId: number,
    type:any
  ) {
    log("Update store Status");
    await this.Order.findOneAndUpdate({ _id: orderId }, { $set: { PaymentStatusId: paymentStatusId, PaymentStatus: paymentStatus, "OrderStatusHistory.PaymentType": type} }, {useFindAndModify: false}).exec();
  }
  async updateStatus(
    orderId: string,
    storeId: string,
    condition: any
  ) {
    log("Update store Status");
    const orderData= await this.Order.findOneAndUpdate({ StoreId: storeId, _id: orderId }, { $set: { OrderStatusId: condition.StatusId, "OrderStatusHistory.StatusId": condition.StatusId, "OrderStatusHistory.Message": condition.Message, "OrderStatusHistory.ExpectedTime": condition.ExpectedTime, "OrderStatusHistory.CreatedBy": condition.CreatedBy, "OrderStatusHistory.CreatedOnUtc": moment.utc() } }).exec();
    return orderData;
  }
}

export default new OrderLogDao();
