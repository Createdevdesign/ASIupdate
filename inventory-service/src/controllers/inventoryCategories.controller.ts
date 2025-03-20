import express from 'express';
import inventoryCategoriesService from '../services/inventoryCategories.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:stores-controller');

class InventoryCategoriesController {
    async createInventoryCategories(req: express.Request, res: express.Response) {
        try {
            let storeId:any=req.params.storeId;
            if(!storeId){
                return res.status(404).send({errors:['store id is not found']});
            }
            if(res.locals.jwt.storeId){
                if(res.locals.jwt.storeId !== storeId){
                    return res.status(400).send({errors:['selected store and store id is mismatch']})  
                }
            }
            let body:any = req.body;
            
            const createCategories = await inventoryCategoriesService.createCategoriesAndUpdateUsingStoreId(storeId, body, "categotyId", "insert");
            if(!createCategories){
                return res.status(404).send({errors:['Create categories error.']});        
            }
            return res.status(201).send();    
        } catch (error) {
            return res.status(400).send({errors:['Create categories error .']})
        }        
    }  
    async updateInventoryCategories(req: express.Request, res: express.Response) {
        try {
            let categoryId:any = req.params.categoryId;
            let storeId:any=req.params.storeId;
            if(!storeId && !categoryId){
                return res.status(404).send({errors:['store id and category id is not found']})
            }
            if(res.locals.jwt.storeId){
                if(res.locals.jwt.storeId !== storeId){
                    return res.status(400).send({errors:['selected store and store id is mismatch']})  
                }
            }
            let body:any = req.body;
            const createCategories = await inventoryCategoriesService.createCategoriesAndUpdateUsingStoreId(storeId, body, categoryId, "update");
            if(!createCategories){
                return res.status(404).send({errors:['Update categories error.']});        
            }
            return res.status(200).send();    
        } catch (error) {
            return res.status(404).send({errors:['Update categories error.']})
        }        
    }   
}

export default new InventoryCategoriesController();
