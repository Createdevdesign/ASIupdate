import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import shortid from 'shortid';
import debug from 'debug';
import moment from 'moment';
// import { CreateStoreDto } from '../dto/create.store.dto';
// import { PatchStoreDto } from '../dto/patch.store.dto';
// import { PutStoreDto } from '../dto/put.store.dto';

const log: debug.IDebugger = debug('app:authclient-dao');

class AuthLogDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;

    authLogSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        Type: {
            type: String,
        },
        Sub: String,
        DeviceId: { type: String },
        UserAgent: { type: String },
        ClientId: { type: String },
        Attempts: { type: Number, default: 0 },
        FailedAttempts: { type: Number, default: 0 },
        LastFailedAttemptDate:{ type: Date },
        IPAddress:{ type: String },
        CreatedDateOnUtc:{ type: Date },
        ModifiedDateOnUtc:{ type: Date, default: moment().utc() },
        ResponseKey: { type: String },
        LastVerificationStatus: { type: String },
        VonageKey: { type: String }
    });

    AuthLog = mongooseService.getMongoose().model('AuthLog', this.authLogSchema, 'AuthLog');
    
    constructor() {
        log('Created new instance of AuthLogDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async findByAuthLogUsingPhoneNumber(clientId: string, deviceId: string, phoneNumber:string) {
        return await this.AuthLog.findOne({ ClientId: clientId, Sub:phoneNumber, DeviceId: deviceId }).exec();
    }

    async updateFailedAttemptData(clientId: string, deviceId:string, phoneNumber:any,  data:any) {
        log("Find Auth log by cliendId");
        return await this.AuthLog.findOneAndUpdate({ ClientId: clientId, Sub:phoneNumber, DeviceId: deviceId},{ $set:data }).exec();
    }
    async findByAuthLogusingClientId(clientId: string, phoneNumber:number, deviceId:string, data:any){
        log("Find Auth log by cliendId", data);
        return await this.AuthLog.findOne({ ClientId: clientId, Sub:phoneNumber, DeviceId: deviceId}).exec();
    }

    async updateAuthLog(clientId: string, phoneNumber:number, deviceId:string, data:any) {
        log("Find Auth log by cliendId");
        return  await this.AuthLog.findOneAndUpdate({ ClientId: clientId, Sub:phoneNumber, DeviceId: deviceId},{ $inc: { Attempts: 1 }, $set:data }).exec();
    }
    async createAuthLog(createAuthLog: any) {
        log("Saving AuthLog.");
        return await this.AuthLog.create(createAuthLog);
    }
    async updateAuthFailedLog(clientId: string, phoneNumber:number, deviceId:string, data:any) {
        log("Find Auth log by cliendId");
        const authLog: any = await this.AuthLog.findOneAndUpdate({ ClientId: clientId, Sub:phoneNumber, DeviceId: deviceId},{ $inc: { FailedAttempts: 1 }, $set:data }).exec();
        return authLog;
      }
    
    async findByAuthLogusingResponseKey(ResponseKey){
        log("Find Auth log by Responsekey");
        return await this.AuthLog.findOne({"ResponseKey":ResponseKey}).exec();
    }

    async findByAuthLogusingClientIdAndPhoneNumber(clientId: string, phoneNumber:number, deviceId:string){
        log("Find Auth log by cliendId");
        return await this.AuthLog.findOne({ ClientId: clientId, Sub:phoneNumber, DeviceId: deviceId}).exec();
        
    }
    async updateAuthLogbyClientId(clientId: string, phoneNumber:number, deviceId:string, data:any){
        log("Find Auth log by cliendId");
        return await this.AuthLog.findOneAndUpdate({ ClientId: clientId, Sub:phoneNumber, DeviceId: deviceId},{ $set:data }).exec();
      }
}

export default new AuthLogDao();
