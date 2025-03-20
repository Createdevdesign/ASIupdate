import express from 'express';
import configurationService from '../services/config.service';
import debug from 'debug';
const url = require('url');


const log: debug.IDebugger = debug('app:config-controller');

class ConfigurationController {
    async getStoreConfigInfo(req: express.Request, res: express.Response) {
        const storeConfigInfo = await configurationService.getStoreConfigInfo(req.params.name, req.params.storeId);
        console.log(req.params.name + " " + storeConfigInfo);
        return res.status(storeConfigInfo.status).send(storeConfigInfo.message);
    }
    
    async getStoreConfigs(req: express.Request, res: express.Response) {
        // const current_url = new URL(req.get('host') + req.originalUrl);
        // const search_params = current_url.searchParams;
        // console.log();
        // const searchQuery = search_params.get('search');
        let searchQuery:any;
        if(req.query.search){
            searchQuery=req.query.search;
            console.log(searchQuery);
        }
        const storeConfigInfo = await configurationService.getStoreConfigs(searchQuery);
        return res.status(storeConfigInfo.status).send(storeConfigInfo.message);
    }
    
    async getConfigs(req: express.Request, res: express.Response) {
        // const current_url = new URL(req.get('host') + req.originalUrl);
        let searchQuery:any;
        if(req.query.search){
            searchQuery=req.query.search;
        }
        //const searchQuery = search_params.get('search');
        const storeConfigInfo = await configurationService.getConfigs(searchQuery);
        return res.status(storeConfigInfo.status).send(storeConfigInfo.message);
    }

    async getConfigInfo(req: express.Request, res: express.Response) {
        const configInfo = await configurationService.getConfigInfo(req.params.name);
        console.log(req.params.name + " " + configInfo);
        return res.status(configInfo.status).send(configInfo.message);
    }
    
    async createStoreConfigInfo(req: express.Request, res: express.Response) {
        const createInfo: any = await configurationService.createStoreConfigInfo(req.params.storeId, req.body);
        console.log(req.params.storeId + "+++++" + createInfo);
        if(createInfo.message === true){
            return res.status(createInfo.status).send();
        }else{
            return res.status(createInfo.status).send(createInfo.message);
        }
        
    }
    
    async createConfigInfo(req: express.Request, res: express.Response) {
        const createInfo: any = await configurationService.createConfigInfo(req.body);
        console.log(req.body + "+++++");
        if(createInfo.message === true){
            return res.status(createInfo.status).send();
        }else{
            return res.status(createInfo.status).send(createInfo.message);
        }
    }
    
    async updateStoreConfigInfo(req: express.Request, res: express.Response) {
        const updateInfo: any = await configurationService.updateStoreConfigInfo(req.params.name, req.params.storeId, req.body);
        console.log(req.params.storeId + "+++++");
        if(updateInfo.message === true){
            return res.status(updateInfo.status).send();
        }else{
            return res.status(updateInfo.status).send(updateInfo.message);
        }
        
    }
    
    async updateConfigInfo(req: express.Request, res: express.Response) {
        const updateInfo: any = await configurationService.updateConfigInfo(req.params.name, req.body);
        console.log(req.params.name + "+++++");
        
        if(updateInfo.message === true){
            return res.status(updateInfo.status).send();
        }else{
            return res.status(updateInfo.status).send(updateInfo.message);
        }
        // res.status(updateInfo.status).send(updateInfo.message);
    }
    async deleteStoreConfigInfo(req: express.Request, res: express.Response) {
        const deleteInfo: any = await configurationService.deleteStoreConfigInfo(req.params.name ,req.params.storeId);
        console.log(req.params.storeId + "+++++");
        if(deleteInfo.message === true){
            return res.status(deleteInfo.status).send();
        }else{
            return res.status(deleteInfo.status).send(deleteInfo.message);
        }
        
    }
    
    async deleteConfigInfo(req: express.Request, res: express.Response) {
        const deleteInfo: any = await configurationService.deleteConfigInfo(req.params.name);
        console.log(req.params.name + "+++++");
        if(deleteInfo.message === true){
            return res.status(deleteInfo.status).send();
        }else{
            return res.status(deleteInfo.status).send(deleteInfo.message);
        }
        
    }

   
}

export default new ConfigurationController();
