import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:discount-dao');

class StorefeedbackLogDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;
    
    StoreFeedbackSchema = new this.Schema({
      _id: { type: String, default: this.Types.ObjectId },
      CustomerId: {
        type: String,
      },
      StoreId: {
        type: String,
      },
      CategoryType: {
        type: String,
      },
      FeedbackReason: {
        type: String,
      },
      CreatedDate: {
        type: String,
      },
    });
    
    StoreFeedback = mongooseService.getMongoose().model('StoreFeedback', this.StoreFeedbackSchema, 'StoreFeedback');
    
    constructor() {
        log('Created new instance of AuthLogDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async insertStoreFeedback(
      storeFeedbackSession:any
    ){
      log("Insert Store feedback data.");
      const storeFeedback: any = await this.StoreFeedback.create(storeFeedbackSession);
      return storeFeedback;
    }

}

export default new StorefeedbackLogDao();
