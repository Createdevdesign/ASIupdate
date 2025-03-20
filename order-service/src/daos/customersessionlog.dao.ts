import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';
import moment from 'moment';

const log: debug.IDebugger = debug('app:order-note-dao');
const ITokenType = {
  TEMP_STORE_TOKEN:'TEMP_STORE_TOKEN', STORE_TOKEN:'STORE_TOKEN', ANONYMOUS_CUSTOMER_TOKEN:'ANONYMOUS_CUSTOMER_TOKEN', CUSTOMER_TOKEN:'CUSTOMER_TOKEN'
}
class CustomerSessionLogDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;

    CustomerSessionLogSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        CustomerId: { type: String },
        DeviceId: { type: String },
        UserAgent: { type: String },
        ClientId: { type: String },
        type: { type: ITokenType, default: ITokenType.TEMP_STORE_TOKEN},
        StoreId: { type: String },
        AccessToken: {
          JTI: { type: String },
          IssueDate: { type: String },
          Expiry: { type: String },
        },
        RefreshToken: {
          TokenId: { type: String },
          IssueDate: { type: String },
          Expiry: { type: String },
        },
        NotificationId: { type: String },
        RecentIPAddress: { type: String },
        LastIssuedDateTime: { type: Date, default: moment().utc() },
      });
      CustomerSession = mongooseService.getMongoose().model('CustomerSession', this.CustomerSessionLogSchema, 'CustomerSession');
    
    constructor() {
        log('Created new instance of AuthLogDao');
        mongooseService.getMongoose().set('debug', true);
    }
    async findNotificatoinByOrderCustomerId(
      orderData: any
    ) {
      log("Fetching notifications by customer Id.");
      const customerSessionData: any = await this.CustomerSession.aggregate([
        { $match: { CustomerId: orderData.CustomerId } },
        {
          $project: {
            _id: 1,
            NotificationId: 1,
            type:1
          }
        }
      ]).exec();
      const customerNotificatoinIds = await this.getNotificationIds(customerSessionData);
      return customerNotificatoinIds;
    }
  
    async getNotificationIds(customerSessionData: any) {
      let orderInfo: any = customerSessionData;
      let notificationIds:any = [];
      orderInfo.forEach((element:any) => {
        notificationIds.push(element.NotificationId);
      })
      return notificationIds;
    }
    
}

export default new CustomerSessionLogDao();
