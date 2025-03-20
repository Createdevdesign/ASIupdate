import Vonage from "@vonage/server-sdk";
import { FireBaseAppNotification } from "../interfaces";
import debug from 'debug';
var FCM = require('fcm-push');

const log: debug.IDebugger = debug('app:vonage-service');

class FirebaseService implements FireBaseAppNotification {
    
      async sendAppNotification(NotificaitonIds:any, notification_data:any){
        var serverKey = process.env.customer_app_firebase_secret_key; //put your server key here
        var fcm = new FCM(serverKey);
        
        var message = { 
          registration_ids:NotificaitonIds,
          collapse_key: 'Swift serve',
          notification: notification_data.notification_data,
          data: {  
              orderId: notification_data._id
          }
        };
        var sendNotificationData=await this.sendNotificationMethod(message,fcm);
        log("Status of customer notification.", sendNotificationData);
      }
    
      public async sendNotificationMethod(message:any, fcm:any){
        let sendNotificationData = false;
        try {
          await fcm.send(message);
          sendNotificationData= true
        }
        catch(err){
          sendNotificationData= false
        }
        log("Status of notification.", sendNotificationData);
        return sendNotificationData;
      }
}

export default new FirebaseService();
