import AuthClientDao from '../daos/authclient.dao';
import { CRUD } from '@swiftserve/node-common';
import { CreateAuthClientDto } from '../dto/create.authclient.dto';
import { PutStoreDto } from '../dto/put.authclient.dto';
import { PatchStoreDto } from '../dto/patch.authclient.dto';

class AuthClientService implements CRUD {
    async create(resource: CreateAuthClientDto) {
        // return StoresDao.addStore(resource);
    }

    async deleteById(id: string) {
        return "data";
    }

    async list(limit: number, page: number) {
        // return StoresDao.getStores(limit, page);
    }

    async patchById(id: string, resource: PatchStoreDto): Promise<any> {
        // return StoresDao.updateStoreById(id, resource);
    }

    async putById(id: string, resource: PutStoreDto): Promise<any> {
        // return StoresDao.updateStoreById(id, resource);
    }

    async updateById(id: string, resource: CreateAuthClientDto): Promise<any> {
        // return AuthClientDao.updateStoreById(id, resource);
    }
    async readById(id: string) {
        return AuthClientDao.getUserClientAndSecretId(id);
    }

}

export default new AuthClientService();
