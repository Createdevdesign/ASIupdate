import StoresDao from '../daos/stores.dao';
import { CRUD } from '@swiftserve/node-common';
import { CreateStoreDto } from '../dto/create.store.dto';
import { PutStoreDto } from '../dto/put.store.dto';
import { PatchStoreDto } from '../dto/patch.store.dto';
import InventoryCategoriesDao from '../daos/inventorycategories.dao';

class InventoryCategoriesService implements CRUD {
    async create(resource: CreateStoreDto) {
        return StoresDao.addStore(resource);
    }

    async deleteById(id: string) {
        return StoresDao.removeStoreById(id);
    }

    async list(limit: number, page: number) {
        return StoresDao.getStores(limit, page);
    }

    async patchById(id: string, resource: PatchStoreDto): Promise<any> {
        return StoresDao.updateStoreById(id, resource);
    }

    async putById(id: string, resource: PutStoreDto): Promise<any> {
        return StoresDao.updateStoreById(id, resource);
    }

    async readById(id: string) {
        return StoresDao.getStoreById(id);
    }

    async updateById(id: string, resource: CreateStoreDto): Promise<any> {
        return StoresDao.updateStoreById(id, resource);
    }

    async createCategoriesAndUpdateUsingStoreId(storeId: string, body:any, categoryId:string, httpType:string ){
        let categoryObject: any = this.categoryObjectData(body);
        return httpType === "update" ?await InventoryCategoriesDao.updateProductCategoryByProductCategoryId(storeId, categoryId, categoryObject):await InventoryCategoriesDao.createCategory(categoryObject);
        
    }
    public stringAttribute(stringData:any):Promise<String>{
        let stringObject = stringData === undefined ||stringData === "" ||stringData === null?"":stringData;
        return stringObject;
      }
      public booleanAttribute(booleanData:any){
        let booleanAttribute = booleanData === "true" ||booleanData === true?true:false;
        return booleanAttribute;
      }
      public integerAttribute(integerData:any){
        let integerAttribute = integerData === undefined ||integerData === "" ||integerData === null?0:integerData;
        return integerAttribute;
      }
      public integerNullAttribute(integerData:any){
        let integerAttribute = integerData === undefined ||integerData === "" ||integerData === null?null:integerData;
        return integerAttribute;
      }
      public arrayAttribute(arrayData:any){
        let arrayAttribute = arrayData === undefined ||arrayData === "" ||arrayData === null?[]:arrayData;
        return arrayAttribute;
      }
    public categoryObjectData(categoryObject:any){
        let productObjectData:any = {}
       if(categoryObject["name"]) productObjectData["Name"] = this.stringAttribute(categoryObject.name)
       if(categoryObject["seName"]) productObjectData["SeName"] = this.stringAttribute(categoryObject.seName)
       if(categoryObject["description"]) productObjectData["Description"] = this.stringAttribute(categoryObject.description)
       if(categoryObject["limitedToStores"]) productObjectData["LimitedToStores"] = this.booleanAttribute(categoryObject.limitedToStores)
       if(categoryObject["stores"]) productObjectData["Stores"] = this.arrayAttribute(categoryObject.stores)
       if(categoryObject["published"]) {
         productObjectData["Published"] = this.booleanAttribute(categoryObject.published)
        }else{
          productObjectData["Published"] = false
        }
        return productObjectData;
      }
}

export default new InventoryCategoriesService();
