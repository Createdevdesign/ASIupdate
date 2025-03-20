import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import shortid from 'shortid';
import debug from 'debug';
import moment from 'moment';
import { CreateConfigurationDto } from '../dto/create.config.dto';
import { PatchConfigurationDto } from '../dto/patch.config.dto';
import { PutConfigurationDto } from '../dto/put.config.dto';

const log: debug.IDebugger = debug('app:config-dao');

class ConfigurationDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;
    
    ConfigurationSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        Name:{type:String},
        StoreId:{type:String},
        Description:{type:String},
        Type:{type:String},
        Value:{type:Array}
      });
      
   

      Configurations = mongooseService.getMongoose().model('Configurations', this.ConfigurationSchema, 'Configurations');

    constructor() {
        log('Created new instance of ConfigurationDao');
        mongooseService.getMongoose().set('debug', true);
    }

   

    

    async getStoreConfigInfo(name: string, storeId: string) {
        
         const StoreConfig = await this.Configurations.find({Name:name, StoreId:storeId}).exec();
         console.log("--------------" + StoreConfig);
        return StoreConfig;
    }
    
    async getStoreConfigs(searchQuery: any) {
        
        const StoreConfig = await this.Configurations.find({StoreId:{$ne:""}, Type: { $ne: "System"}, Name: {'$regex': searchQuery === undefined?"":searchQuery, $options: 'i'}}).exec();
        console.log("--------------" + StoreConfig.length);
       return StoreConfig;
   }
   
   async getConfigs(searchQuery: any) {
        
    const StoreConfig = await this.Configurations.find({StoreId:{$eq:""}, Type: { $ne: "System"}, Name: {'$regex': searchQuery === undefined?"":searchQuery, $options: 'i'}}).sort({$natural:-1}).exec();
    console.log("--------------" + StoreConfig.length);
   return StoreConfig;
}

    async getConfigInfo(name: string) {
        
        const Config = await this.Configurations.find({Name:name,  StoreId:{$eq:""}}).exec();
        console.log("--------------" + Config);
       return Config;
   }

  async getConfigInfoData(name: string){
    const getConfigData:any= await this.Configurations.aggregate([
      { $match: { Name: name } }
    ]).exec();
    return getConfigData;
  }

  async getStoreConfigInfoData(name: string, storeId: string) {
    const getConfigData:any= await this.Configurations.aggregate([
      { $match: { Name: name, StoreId: storeId } }
    ]).exec();
    return getConfigData;
  }
   
//    async createStoreConfigInfo(storeId: string, body: CreateConfigurationDto) {
        
//     let Name = body.Name;
//     let findStoreName = await this.Configurations.find({ StoreId:storeId });

//     if (findStoreName.length !== 0){
//       return "Name Already Exists";
//     }
//     let data = {
//         "Name" : body.Name,
//         "StoreId" : storeId,
//         "Description" : body.Description,
//         "Type": body.Type,
//         "Value": body.Value
//     };
//     const createStoreConfig = await this.Configurations.create(data);
//     return "Configuation created Successfully";
// }

async createConfigInfo(body: CreateConfigurationDto) {
    const createConfig = await this.Configurations.create(body);
    return createConfig;
}

async getConfigUsingName(name: any) {
        
  return await this.Configurations.find({ Name:name, StoreId:{$eq:""} });
}

async updateStoreConfigInfo(name: string, body: CreateConfigurationDto) {
        
    const updateStoreConfig = await this.Configurations.findOneAndUpdate({Name:name},{$set:body}).exec();
    return updateStoreConfig;
}

async updateConfigInfo(name: string, body: CreateConfigurationDto) {
   
    const updateStoreConfig = await this.Configurations.findOneAndUpdate({Name:name},{$set:body}).exec();
    return updateStoreConfig;
}

async deleteStoreConfigInfo(name: string ,storeId: string) {
    const StoreConfig = await this.Configurations.deleteOne({Name:name, StoreId:storeId }).exec();
   return StoreConfig;
}

async deleteConfigInfo(name: string) {
   
    const StoreConfig = await this.Configurations.deleteOne({ Name:name }).exec();
   return StoreConfig;
}

   
}

export default new ConfigurationDao();
