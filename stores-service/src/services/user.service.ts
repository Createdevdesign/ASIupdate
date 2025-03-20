import StoresDao from '../daos/stores.dao';
import { CRUD } from '@swiftserve/node-common';
import { CreateStoreDto } from '../dto/create.store.dto';
import { PutStoreDto } from '../dto/put.store.dto';
import { PatchStoreDto } from '../dto/patch.store.dto';
import customerlogDao from '../daos/customerlog.dao';
class UserService implements CRUD {
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

    async getAuthorisedStoreList(customerId:string, res:any) {
        let stores:any = await customerlogDao.findStoresByCustomerId(customerId);
        if(!stores){
            return res.status(404).send({errors:['"No Authorized Stores found."']});
        }
        return {data:stores};
    }
}

export default new UserService();
