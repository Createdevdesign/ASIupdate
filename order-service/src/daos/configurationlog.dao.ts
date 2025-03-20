import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';
import moment from 'moment';

const log: debug.IDebugger = debug('app:order-note-dao');

class OrderNoteLogDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;
      
      ConfigurationSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId  },
        Name:{type:String},
        StoreId:{type:String},
        Description:{type:String},
        Type:{type:String},
        Value :{type:Array}
      });
      
      Configurations = mongooseService.getMongoose().model('Configurations', this.ConfigurationSchema, 'Configurations');
    
    constructor() {
        log('Created new instance of AuthLogDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async ConfigNotificationData(ConfigurationNotificationData:any, customerId: string) {
      log("Configuration notifcation data.", customerId);
        let data = customerId
        let getConfigurationNotificationData = await this.Configurations.aggregate([
            { $match: { Name: ConfigurationNotificationData} },
            {
              $lookup: {
                from: 'Customer', 
                let: { "keywordId": data },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$keywordId"] } } },
                ],
                as:"CustomerNotificaitonData"
              }
            },{
              $addFields: {
                "CustomerData":  { $arrayElemAt: ["$CustomerNotificaitonData.GenericAttributes",0]},
                "configNotificaiton": { $arrayElemAt: ["$Value",0]}
            }},    
            { $project: {
              "_id": 1, 
              "Name": 1,
              "Value": "$configNotificaiton",
              "Type": 1,
              "CustomerNotificaitonData":"$CustomerData"
            }},
        ]).exec();
      var results: any = getConfigurationNotificationData?getConfigurationNotificationData[0]:null;
      if(results !== null){
        if(results.CustomerNotificaitonData !== undefined){
          results.CustomerNotificaitonData.filter((item:any)=> {
            if(item.Key === "preferred-notifications"){
              results["CustomerNotificaitonData"] = JSON.parse(item.Value)
            }
          })
        }
      }
      let findalData = {
        configSms:false,
        configEmail:false,
        configPushNotification:false,
        customerPreferenceSms:false,
        customerPreferenceEmail:false,
        customerPreferenceNotificaiton:false
      }
      if(results!== null){
        findalData = {
          configSms:results.Value.sms === undefined?false:results.Value.sms,
          configEmail:results.Value.email === undefined?false:results.Value.email,
          configPushNotification:results.Value.pushNotification === undefined?false:results.Value.pushNotification,
          customerPreferenceSms:results.CustomerNotificaitonData === undefined?false:results.CustomerNotificaitonData.sms === undefined?false:results.CustomerNotificaitonData.sms,
          customerPreferenceEmail:results.CustomerNotificaitonData === undefined?false:results.CustomerNotificaitonData.email === undefined?false:results.CustomerNotificaitonData.email,
          customerPreferenceNotificaiton:results.CustomerNotificaitonData === undefined?false:results.CustomerNotificaitonData.App === undefined?false:results.CustomerNotificaitonData.App 
        }
      }
      return findalData;
    }
}

export default new OrderNoteLogDao();
