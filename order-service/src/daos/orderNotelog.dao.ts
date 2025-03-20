import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';
import moment from 'moment';

const log: debug.IDebugger = debug('app:order-note-dao');
const nearByOrderDistance:any = process.env.nearby_orders_distance_in_meters

class OrderNoteLogDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;
      
      OrderNoteSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId  },
        OrderId:{type:String},
        DownloadId:{type:String},
        DisplayToCustomer:{type:Boolean},
        CreatedByCustomer:{type:Boolean},
        Note:{type:String},
        StatusNote:{type:String},
        CreatedOnUtc: { type: Date, default: moment().utc() },
 
      });
      
      OrderNote = mongooseService.getMongoose().model('OrderNote', this.OrderNoteSchema, 'OrderNote');
    
    constructor() {
        log('Created new instance of AuthLogDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async updateOrderNote(
      orderId:string,
      reason:string
    ) {
      log("Update store Status");
      await this.OrderNote.findOneAndUpdate({OrderId: orderId}, { $set: {StatusNote:reason} }).exec();
    }
}

export default new OrderNoteLogDao();
