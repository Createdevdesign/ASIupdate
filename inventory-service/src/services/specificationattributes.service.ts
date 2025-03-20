import StoresDao from '../daos/stores.dao';
import { CRUD } from '@swiftserve/node-common';
import { CreateStoreDto } from '../dto/create.store.dto';
import { PutStoreDto } from '../dto/put.store.dto';
import { PatchStoreDto } from '../dto/patch.store.dto';
import InventoryDao from '../daos/inventory.dao';
import InventoryCategoriesDao from '../daos/inventorycategories.dao';
import SpecificationAttributesDao from '../daos/specificAttributes.dao';

class SpecificationAttributesService implements CRUD {
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

    async findSpecificAttributesUsingCustomerId(){
        return await SpecificationAttributesDao.getSpecificAttributeUsingCustomerId();
    }
}

export default new SpecificationAttributesService();
