// import StoresDao from '../daos/stores.dao';
import { CRUD } from '@swiftserve/node-common';
import { CreateConfigurationDto } from '../dto/create.config.dto';
import { PutConfigurationDto } from '../dto/put.config.dto';
import { PatchConfigurationDto } from '../dto/patch.config.dto';
import ConfigurationDao from '../daos/config.dao';

class ConfigurationService implements CRUD {
    async create(resource: CreateConfigurationDto) {
        return "";
    }

    async deleteById(id: string) {
        return "";
    }

    async list(limit: number, page: number) {
        return "";
    }

    async patchById(id: string, resource: PatchConfigurationDto): Promise<any> {
    }

    async putById(id: string, resource: PutConfigurationDto): Promise<any> {
    }

    async readById(id: string) {
    }

    async updateById(id: string, resource: CreateConfigurationDto): Promise<any> {
    }
    async getStoreConfigInfo (name: string, storeId: string) {
        let findStoreName: any = await ConfigurationDao.getStoreConfigInfo(name, storeId);
    
        if (findStoreName.length === 0){
          return {status:404, message:{errors:['Name does not exists']}};
        }
    
        let getStoreConfigData = await ConfigurationDao.getStoreConfigInfoData(name, storeId);
        if (!getStoreConfigData) {
          return {status:403, message:{errors:['get Store Config error']}};
        }else{
          return {status:200, message:{data:getStoreConfigData}};
        }
    }
    
    async getStoreConfigs (searchQuery: any) {
     let getConfigData = await ConfigurationDao.getStoreConfigs(searchQuery);
    if (!getConfigData) {
      return {status:404, message:{errors:['get Config error']}};
    }else{
        return {status:200, message:{data:getConfigData}};
    }
    }
    
    async getConfigs (searchQuery: any) {
        let getConfigData = await ConfigurationDao.getConfigs(searchQuery);
        if (!getConfigData) {
          return {status:404, message:{errors:['get Config error']}};
        }else{
            return {status:200, message:{data:getConfigData}};
        }
    }

    async getConfigInfo (name: string) {
         let findStoreName: any = await ConfigurationDao.getConfigInfo(name);
    
        if (findStoreName.length === 0){
          return {status:404, message:{errors:['Name does not exists']}};
        }
    
        let getStoreConfigData = await ConfigurationDao.getConfigInfoData(name);
        if (!getStoreConfigData) {
          return {status:404, message:{errors:['get Store Config error']}};
        }else{
            return {status:200, message:{data:getStoreConfigData}};
        }
    }

    async createStoreConfigInfo (storeId: string, body: any) {
        let findStoreName:any = await ConfigurationDao.getStoreConfigInfo(body.Name, storeId);
        console.log("---------------" + findStoreName.length);
        if (findStoreName.length !== 0){
            return {status:403, message:{errors:['Name Already Exists']}};
        } 
        body['StoreId']=storeId;
        let createStoreConfigData = await ConfigurationDao.createConfigInfo(body);
        if (!createStoreConfigData) {
            return {status:404, message:{errors:['create config error']}};
        }else{
            return {status:200, message:true};
        }
    }
    
    async createConfigInfo (body: any) {
        let findStoreName:any = await ConfigurationDao.getConfigUsingName(body.Name);
        if (findStoreName.length !== 0){
            return {status:403, message:{errors:['Name Already Exists']}};
        } 
        
        body['StoreId']="";
        let createStoreConfigData = await ConfigurationDao.createConfigInfo(body);
        if (!createStoreConfigData) {
            return {status:404, message:{errors:['create config error']}};
        }else{
            return {status:200, message:true};
        }
    }
    
    async updateStoreConfigInfo (name: string, storeId: string, body: any) {
        let findStoreName: any = await ConfigurationDao.getStoreConfigInfo(name, storeId);
        if (findStoreName.length === 0){
            return {status:404, message:{errors:['Name doesnot exist']}};
        }
            // logger.debug("find config data using body name");
        let Name = body["Name"];
        if(name !== Name){
          let findNameUsingBodyName: any = await ConfigurationDao.getStoreConfigInfo(Name, storeId);
          if (findNameUsingBodyName.length !== 0){
            return {status:404, message:{errors:['Name is already exist']}};
          }
        }
        let updateConfigData = await ConfigurationDao.updateStoreConfigInfo(name, body);
        if (!updateConfigData) {
          return {status:404, message:{errors:['Update store error']}};
        }else{
          return {status:200, message:true}
        }
    }
    
    async updateConfigInfo (name: string, body: any) {
    let findStoreName: any = await ConfigurationDao.getConfigUsingName(name);
    if (findStoreName.length === 0){
        return {status:404, message:{errors:['Name doesnot exist']}};
    }
        // logger.debug("find config data using body name");
    let Name = body["Name"];
    if(name !== Name){
      let findNameUsingBodyName: any = await ConfigurationDao.getConfigUsingName(Name);
      if (findNameUsingBodyName.length !== 0){
        return {status:404, message:{errors:['Name is already exist']}};
      }
    }
    body['StoreId']="";
    let updateConfigData = await ConfigurationDao.updateConfigInfo(name, body);
    if (!updateConfigData) {
      return {status:404, message:{errors:['Update store error']}};
    }else{
        return {status:200, message:true};
    }
        
    }
    
    async deleteStoreConfigInfo (name:string, storeId: string) {   
        let findStoreName: any = await ConfigurationDao.getStoreConfigInfo(name, storeId);
        if (findStoreName.length === 0){
          return {status:404, message:{errors:['Name does not exists']}};
        }
    
        let updateStoreConfigData = await ConfigurationDao.deleteStoreConfigInfo(name, storeId);
        if (!updateStoreConfigData) {
          return {status:404, message:{errors:['Delete config error']}};
        }else{
            return {status:200, message:true};
        }
    }
    
    
    async deleteConfigInfo (name: string) {
        // logger.debug("find config data using name");
        let findStoreName: any = await ConfigurationDao.getConfigUsingName(name);
        if (findStoreName.length === 0){
          return {status:404, message:{errors:['Name does not exists']}};
        }
    
        let updateStoreConfigData = await ConfigurationDao.deleteConfigInfo(name);
        if (!updateStoreConfigData) {
          return {status:404, message:{errors:['Delete config error']}};
        }else{
            return {status:200, message:true};
        }
    }

}

export default new ConfigurationService();
