import express from 'express';
import storesService from '../services/stores.service';
import debug from 'debug';
import userService from '../services/user.service';
import discountService from '../services/discount.service';
import storeregistrationService from '../services/storeregistration.service';
import storefeedbackService from '../services/storefeedback.service';

const log: debug.IDebugger = debug('app:stores-controller');

class StoresController {
    async listStores(req: express.Request, res: express.Response) {
        try {
            let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
            let headers:any= req.headers;
            let xLatitude:any = headers['x-lat'] === undefined || headers['x-lat'] === ""|| headers['x-lat'] === null|| headers['x-lat'] === 'null'?0.000000:headers['x-lat'];
            let xLongitude:any = headers['x-long'] === undefined || headers['x-long'] === "" || headers['x-long'] === null || headers['x-long'] === 'null'?0.000000:headers['x-long'];
            let stores:any;
            if(headers['apptype'] === "customer"){
                stores = await storesService.getStoreList(customerId, req.query, xLatitude, xLongitude, res);
            }else{
                stores = await userService.getAuthorisedStoreList(customerId, res);
                
            }    
            res.status(200).send(stores);    
        } catch (error) {
            return res.status(400).send(error);        
        }
        
    }

    async getStoreById(req: express.Request, res: express.Response) {
        let storeId:any = req.params.storeId;
        let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
        if(!storeId){
            res.status(404).send({errors:["Store id is not found"]});
        }
        if(res.locals.jwt.storeId){
            if(res.locals.jwt.storeId !== storeId){
                return res.status(400).send({errors:['selected store and store id is mismatch']})  
            }
        }
        const store = await storesService.getStoreByStoreAndCustomerId(storeId, customerId);
        if(!store){
            res.status(404).send({errors:["No Authorized Stores found."]});
        }
        res.status(200).send({data: store});
    }

    async createStore(req: express.Request, res: express.Response) {
        const storeId = await storesService.create(req.body);
        res.status(201).send({ id: storeId });
    }

    async patch(req: express.Request, res: express.Response) {
        log(await storesService.patchById(req.params.storeId, req.body));
        res.status(204).send();
    }

    async put(req: express.Request, res: express.Response) {
        log(await storesService.putById(req.params.storeId, req.body));
        res.status(204).send();
    }

    async removeStore(req: express.Request, res: express.Response) {
        log(await storesService.deleteById(req.params.storeId));
        res.status(204).send();
    }

    getStorePromotionList = async (req: express.Request, res: express.Response) => {
        try {
            let storeId:any = req.params.storeId;
            if(!storeId){
                res.status(404).send({errors:["Store id is not found"]});
            }
            let storePromotions:any = await discountService.getStorePromotionList(req.query,storeId);
            return res.status(200).send(storePromotions);    
        } catch (error) {
            return res.status(400).send(error);    
        }   
    }

    getStoreHours =async (req: express.Request, res: express.Response) => {
        try {
            let storeId:any = req.params.storeId;
            let header:any = req.headers;
            if(!storeId){
                res.status(404).send({errors:["Store id is not found"]});
            }
            let storeHours:any = await storesService.getStoreHoursInfo(storeId, header['x-timezone'], req.query, res)
            return res.status(200).send({data:storeHours});
        } catch (error) {
            return res.status(400).send(error);    
        }
    }

    getRecentCarts =async (req: express.Request, res: express.Response) => {
        try {
            let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
            let storeHours:any = await storesService.getCustomerRecentStoreCartList(customerId, req.query, res)
            return res.status(200).send(storeHours);
        } catch (error) {
            return res.status(400).send(error);    
        }
    }

    getActivateStore =async (req: express.Request, res: express.Response) => {
        let id:any = req.params.activeId;
        let activateStoreData:any = await storeregistrationService.activeStoreAccount(id, res)
        return res.status(200).send(activateStoreData);
    }

    createFeedback =async (req: express.Request, res: express.Response) => {
        let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
        let storeId:any = req.params.storeId;
        if(res.locals.jwt.storeId){
            if(res.locals.jwt.storeId !== storeId){
                return res.status(400).send({errors:['selected store and store id is mismatch']})  
            }
        }
        let body:any = req.body
        let feeedbackData:any = await storefeedbackService.createStoreFeedback(customerId, storeId, body)
        return res.status(feeedbackData.status).send(feeedbackData.response);
    }

    uploadStoreAssets =async (req: express.Request, res: express.Response) => {
        let storeId:any = req.params.storeId;
        let type:any = req.query.type;
        if(res.locals.jwt.storeId){
            if(res.locals.jwt.storeId !== storeId){
                return res.status(400).send({errors:['selected store and store id is mismatch']})  
            }
        }
        let imageData:any = req.files;
        // return res.status(200).send(imageData)  
        let uploadAssetData:any = await storesService.updateStoreAssets(storeId, type, imageData)
        return res.status(uploadAssetData.status).send(uploadAssetData.message);
    }

    deleteStoreAssetData =async (req: express.Request, res: express.Response) => {
        let storeId:any = req.params.storeId;
        let type:any = req.query.type;
        let imageData:any = req.body["image"];
        if(res.locals.jwt.storeId){
            if(res.locals.jwt.storeId !== storeId){
                return res.status(400).send({errors:['selected store and store id is mismatch']})  
            }
        }
        let deleteAssetData:any = await storesService.deleteStoreAssets(storeId, type, imageData)
        return res.status(deleteAssetData.status).send(deleteAssetData.message);
    }
    
    getStateProvincess =async (req: express.Request, res: express.Response) => {
        let getStateProvincess:any = await storesService.getStateProvincess();
        return res.status(getStateProvincess.status).send(getStateProvincess.message);
    }

    async updateStoreHours(req: express.Request, res: express.Response){
        const storeId = req.params.storeId;
        console.log(storeId);
        var body:any = JSON.stringify(req.body).replace(/(\r\n|\n|\r)/gm, '');
      
        const updateStoreHours= await storesService.updateStoreHours(
          storeId,
          body
        );
        return res.status(updateStoreHours.status).send(updateStoreHours.message);
      }
      scanQrCode =async (req: express.Request, res: express.Response) => {
        let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
        let extId:any = req.params.extId;
        let header:any = req.headers;
        let scanQrCode:any = await storesService.scanQrCode(customerId, extId,  header['x-timezone']);
        return res.status(scanQrCode.status).send(scanQrCode.message);
    }
}


export default new StoresController();
