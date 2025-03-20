import express from 'express';
import storesService from '../services/stores.service';
import debug from 'debug';
import { PatchStoreDto } from '../dto/patch.store.dto';

const log: debug.IDebugger = debug('app:stores-controller');

class StoresController {
    async listStores(req: express.Request, res: express.Response) {
        const stores = await storesService.list(100, 0);
        res.status(200).send(stores);
    }

    async getStoreById(req: express.Request, res: express.Response) {
        const store = await storesService.readById(req.params.storeId);
        res.status(200).send(store);
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
}

export default new StoresController();
