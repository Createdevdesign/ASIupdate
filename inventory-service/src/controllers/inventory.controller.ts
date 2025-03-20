import express from 'express';
import inventoryService from '../services/inventory.service';
import debug from 'debug';
import { PatchStoreDto } from '../dto/patch.store.dto';

const log: debug.IDebugger = debug('app:stores-controller');

class InvnentoryController {
    async listInventorys(req: express.Request, res: express.Response) {
        try {
            let storeId:any=req.params.storeId;
            if(!storeId){
                return res.status(400).send({errors:['Store id is required']})
            }
            let published:boolean = true;
            if(res.locals.jwt.storeId){
                if(storeId !== res.locals.jwt.storeId){
                    return res.status(400).send({errors:['selected store and store id is mismatch']})  
                }
                published = false;
            }
            let queryData:any = req.query;
            if(queryData && queryData.type){
                var typeArray:any=queryData.type.split(',');
                queryData["type"]=typeArray;
            }
            queryData["inStore"]=queryData.inStore === "true" || queryData.inStore === true ? true : false;
            const stores = await inventoryService.getProductsByStoreId(storeId, queryData, published, res);
            return res.status(200).send(stores);    
        } catch (error) {
            return res.status(403).send({errors:['user is not authorised to access']})
        }

        
    } 
    
    async listInventoryAttributes(req: express.Request, res: express.Response) {
        try {
            let storeId:any=req.params.storeId;
            
            if(!storeId){
                return res.status(404).send({errors:['store Id is not found']})
            }
            if(res.locals.jwt.storeId){
                if(storeId !== res.locals.jwt.storeId){
                    return res.status(400).send({errors:['selected store and store id is mismatch']})  
                }
            }
            let queryData:any = req.query;
            const inventoryAttribute = await inventoryService.getProductsAttributesByStoreId(storeId, queryData, res);
            return res.status(200).send(inventoryAttribute);    
        } catch (error) {
            return res.status(404).send({errors:['product attributes not found']})
        }        
    } 

    async getInventory(req: express.Request, res: express.Response) {
        try {
            let storeId:any=req.params.storeId;
            
            if(!storeId){
                return res.status(404).send({errors:['store id is not found']})
            }
            let published:boolean = true;
            // if(headers['x-store-id']){
            if(res.locals.jwt.storeId){
                if(res.locals.jwt.storeId !== storeId){
                    return res.status(400).send({errors:['selected store and store id is mismatch']})  
                }
                published = false;
            }
            const stores = await inventoryService.getProductByStoreIdAndProductId(storeId, req.params.productId, published, res);
            return res.status(200).send({data:stores});    
        } catch (error) {
            return res.status(400).send({errors:['get inventory error']})
        }  
    } 

    async updateProductAttributes(req: express.Request, res: express.Response) {
        try {
            let storeId:any = req.params.storeId;
            let productId: string = req.params.productId;
            let attributeId: string = req.params.attributeId;
            if(!storeId){
                return res.status(404).send({errors:['store id is not found']})
            }
            if(res.locals.jwt.storeId){
                if(res.locals.jwt.storeId !== storeId){
                    return res.status(400).send({errors:['selected store and store id is mismatch']})  
                }
            }
            
            const inventoryAttribute = await inventoryService.updateProductAttributeUsingProductIdAndProductAttributeId(storeId, productId, attributeId, req.body);
            if(!inventoryAttribute){
                return res.status(404).send({errors:['inventory attribute update error']})    
            }
            return res.status(200).send();    
        } catch (error) {
            return res.status(403).send({errors:['user is not authorised to access']})
        }  
    } 

    async createInventory(req: express.Request, res: express.Response) {
        try {
            let storeId:any= req.params.storeId;
            if(!storeId){
                return res.status(404).send({errors:['store id is not found']})
            }
            if(res.locals.jwt.storeId){
                if(res.locals.jwt.storeId !== storeId){
                    return res.status(400).send({errors:['selected store and store id is mismatch']})  
                }
            }
            let body:any = req.body;
            let productId:any;
            if(req.params.productId){
                productId = req.params.productId;
            }
            const inventoryAttribute = await inventoryService.createProductUsingStoreId(storeId, body, res, productId);
            return res.status(200).send({data:inventoryAttribute});    
        } catch (error) {
            return res.status(400).send({errors:['create inventory error ']})
        }        
    }

    uploadInventoryAssets =async (req: express.Request, res: express.Response) => {
        let imageData:any = req.files;
        let storeId:any= req.params.storeId;
        let inventoryId:any= req.params.inventoryId;
        if(res.locals.jwt.storeId){
            if(res.locals.jwt.storeId !== storeId){
                return res.status(400).send({errors:['selected store and store id is mismatch']})  
            }
        }
        let uploadAssetData:any= await inventoryService.uploadInventoryAssetusingProductId(storeId, inventoryId, imageData);
        return res.status(uploadAssetData.status).send(uploadAssetData.message);
    }

    updateInventoryAsset =async (req: express.Request, res: express.Response) => {
        let imageData:any = req.files;
        let storeId:any= req.params.storeId;
        let inventoryId:any= req.params.inventoryId;
        let pictureId:any= req.params.assetId;
        if(res.locals.jwt.storeId){
            if(res.locals.jwt.storeId !== storeId){
                return res.status(400).send({errors:['selected store and store id is mismatch']})  
            }
        }
        let uploadAssetData:any= await inventoryService.updateInventoryImageUsingInventoryIdAndPictureId(storeId, inventoryId, pictureId, imageData);
        return res.status(uploadAssetData.status).send(uploadAssetData.message);
    }

    deleteInventoryAsset =async (req: express.Request, res: express.Response) => {
        let imageData:any = req.files;
        let storeId:any= req.params.storeId;
        let inventoryId:any= req.params.inventoryId;
        let pictureId:any= req.params.assetId;
        if(res.locals.jwt.storeId){
            if(res.locals.jwt.storeId !== storeId){
                return res.status(400).send({errors:['selected store and store id is mismatch']})  
            }
        }
        let uploadAssetData:any= await inventoryService.deleteProductImage(storeId, inventoryId, pictureId);
        return res.status(uploadAssetData.status).send(uploadAssetData.message);
    }
}

export default new InvnentoryController();
