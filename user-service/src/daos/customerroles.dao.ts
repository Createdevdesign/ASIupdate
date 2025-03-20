import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:customer-dao');

class CustomerRoleDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;

    customerRoleSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        Name: {
          type: String,
        },
        SystemName: {
          type: String,
        },
        Active: {
          type: Boolean,
        },
        IsSystemRole: {
          type: Boolean,
        },
        TaxExempt: {
          type: Boolean,
        }
    });

    CustomerRole = mongooseService.getMongoose().model('CustomerRole', this.customerRoleSchema, 'CustomerRole');
    
    constructor() {
        log('Created new instance of CustomerRoleDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async findUserRolesusingCustomerId(customerId:string, queryData:any) {
      log("find roles.", customerId);
      
      let paginationData:any =  []
      let Page = 1;
      if(queryData.page && queryData.limit){
        Page =  parseInt(queryData.page);
        const Limit = parseInt(queryData.limit);
        var Offset: number = (Page - 1) * Limit;
        paginationData =  [ { $skip: Offset }, { $limit: Limit } ]
      }
      const userRolesInfo: any = await this.CustomerRole.aggregate([
        { $match: { Active:true } },
        {
          $project: {
            _id: 1,
            Name:1,
            SystemName:1,
            FreeShipping:1,
            Active:1,
            IsSystemRole:1
          }
        },
        ]).facet({
        total: [{ $count: 'total' }],
        data: paginationData // add projection here wish you re-shape the docs
        }).addFields({
        "total": {
          "$ifNull": [{ "$arrayElemAt": [ "$total.total", 0 ] }, 0]
        },
        "page": Page
        }).exec();
      return userRolesInfo?userRolesInfo[0]:null;
    }
}

export default new CustomerRoleDao();
