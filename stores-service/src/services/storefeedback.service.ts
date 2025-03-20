import storefeedbacklogDao from "../daos/storefeedbacklog.dao";
const moment = require('moment-timezone');

class StoreFeedbackService {
  async createStoreFeedback(customerId: string,storeId: string, body: any){
    const storeFeedbackSession:any = {
      CustomerId:customerId,
      StoreId:storeId,
      CategoryType: body.type,
      FeedbackReason: body.message,
      CreatedDate: moment().utc().format(),
      // CreatedDate: moment.unix(1617621273).utc().format()
    }
    let insertAssetData = await storefeedbacklogDao.insertStoreFeedback(storeFeedbackSession);
    if (!insertAssetData) {
      return { status:404, response: {errors:["Insert store feedback error"]}}
    }
    return { status:201, response: ""}
  }
}

export default new StoreFeedbackService();
