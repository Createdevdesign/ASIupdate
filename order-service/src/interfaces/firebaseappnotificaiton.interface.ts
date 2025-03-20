export interface FireBaseAppNotification {
    sendAppNotification: (NotificaitonIds:any, notification_data:any) => Promise<any>;
}