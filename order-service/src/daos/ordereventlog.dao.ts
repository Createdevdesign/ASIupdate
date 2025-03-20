import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';
import moment from 'moment';

const log: debug.IDebugger = debug('app:order-note-dao');

class OrderEventLogDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;
      
    OrderEventsListSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId  },
        EventType:{ type: String },
        OrderNumber: { type: String },
        EventDetail: { type: String },
        TriggeredBy: { type: String },
        CreatedDateOnUtc: { type: String }
      });
      OrderEventLogSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        Type:{ type: String },
        OrderId:{ type: String },
        CreatedDateOnUtc: { type: String },
        Events: {type: [this.OrderEventsListSchema]},
      });
      OrderEventLog = mongooseService.getMongoose().model('OrderEventLog', this.OrderEventLogSchema, 'OrderEventLog');
    
    constructor() {
        log('Created new instance of AuthLogDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async FetchNotificationDataUsing(NotificationData:any,customerNotification:any) {
      log("Create and update Order event log.");
      const EventData = {
        EventType: "SMS-NOTIFICATION",
        OrderNumber: customerNotification.OrderNumber,
        EventDetail: "Sent notificaiton",
        TriggeredBy: "STORE-Manager",
        CreatedDateOnUtc:new Date().toISOString(),
      }
      let data1 = await this.OrderEventLog.findOne({ OrderId: customerNotification._id });
      if(data1 === null){
        log("Create Order event log.");
        await this.OrderEventLog.create({
          type: "ORDER",
          OrderId:customerNotification._id,
          CreatedDateOnUtc:new Date().toISOString(),
          Events:EventData
        });
      }else{
        log("Update Order event log.");
        await this.OrderEventLog.findOneAndUpdate({ OrderId: customerNotification._id }, { $push: { Events: EventData } }).exec();
      }
    return true;
  }

  async findOrderEvent(OrderId:string):Promise<any> {
    const orderData = await this.OrderEventLog.find({OrderId: OrderId}).exec()
    return orderData;
  }

  async updateOrderEvents(OrderId:string, EventData:any) {
    log("Update Event Logs");
    await this.OrderEventLog.findOneAndUpdate({ OrderId: OrderId }, { $push: { Events: EventData} }).exec();
  }
  async createOrderEvents(NewEventData:any) {
    log("Create Event Logs");
    await this.OrderEventLog.create(NewEventData);
  }
}

export default new OrderEventLogDao();
