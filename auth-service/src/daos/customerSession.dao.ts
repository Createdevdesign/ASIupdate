import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';
import { v4 as uuid } from 'uuid';
import moment from 'moment';
// import { CreateStoreDto } from '../dto/create.store.dto';
// import { PatchStoreDto } from '../dto/patch.store.dto';
// import { PutStoreDto } from '../dto/put.store.dto';

const log: debug.IDebugger = debug('app:authclient-dao');
const ITokenType =  {
    TEMP_STORE_TOKEN:'TEMP_STORE_TOKEN', STORE_TOKEN:'STORE_TOKEN', ANONYMOUS_CUSTOMER_TOKEN:'ANONYMOUS_CUSTOMER_TOKEN', CUSTOMER_TOKEN:'CUSTOMER_TOKEN'
}
class CustomerSessionDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;
    
    CustomerSessionSchema = new this.Schema({
        _id: { type: String, default: uuid(), required: true },
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
        loginMethod: { type: String }
    });

    CustomerSession = mongooseService.getMongoose().model('CustomerSession', this.CustomerSessionSchema, 'CustomerSession');
    
    constructor() {
        log('Created new instance of StoreDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async deleteUserSessions(customerId: String, deviceId: String) {
        log("Delete all Customer Sessions for a deviceId.");
        await this.CustomerSession.deleteMany({CustomerId: customerId, DeviceId: deviceId}).exec();
    }

    async save(session: any) {
        log("Saving Customer Session.");
        session._id = uuid();
        const customerSession: any = await this.CustomerSession.create(session);
        return customerSession;
    }

    async findByDeviceId(customerId: String, deviceId: String) {
        log("Find all Customer Sessions for a deviceId.");
        const customerSessions: any = await this.CustomerSession.find({CustomerId: customerId, DeviceId: deviceId}).exec();
        if(customerSessions.length){
            return true
        }else{
            return false
        }
      }

      async deleteDeviceIdAndID(customerId: string, deviceId: string){
        const customerSession: any= await this.CustomerSession.deleteOne({ CustomerId:customerId, DeviceId: deviceId }).exec();
        return customerSession?1:0;
      }

      async findByRefreshTokenId(customerId: String, tokenId: String, type: any){
        log("Find all Customer Sessions for a refresh Id.");
        const customerSessions: any = await this.CustomerSession.find({CustomerId: customerId, 'RefreshToken.TokenId': tokenId, type: type}).exec();
        return customerSessions;
      }

      async updateUserSessions(customerId: String, deviceId: String, clientId: String, session: any) {
        log("Update Customer Sessions for a deviceId for refresh token.");
        await this.CustomerSession.findOneAndUpdate({CustomerId: customerId, DeviceId: deviceId,ClientId:clientId}, { $set: { "AccessToken": session.AccessToken,"RecentIPAddress":session.RecentIPAddress,"LastIssuedDateTime":session.LastIssuedDateTime } }).exec();
      }
}

export default new CustomerSessionDao();
