import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import shortid from 'shortid';
import debug from 'debug';
import { CreateStoreDto } from '../dto/create.store.dto';
import { PatchStoreDto } from '../dto/patch.store.dto';
import { PutStoreDto } from '../dto/put.store.dto';

const log: debug.IDebugger = debug('app:stores-dao');

class StoresDao {
    Schema = mongooseService.getMongoose().Schema;

    storesSchema = new this.Schema({
        _id: String,
        name: String
    });

    Store = mongooseService.getMongoose().model('Store', this.storesSchema, 'Store');

    constructor() {
        log('Created new instance of StoreDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async addStore(storeFields: CreateStoreDto) {
        const storeId = shortid.generate();
        const store = new this.Store({
            _id: storeId,
            ...storeFields,
        });
        await store.save();
        return storeId;
    }

    async getUserByEmail(email: string) {
        return this.Store.findOne({ email: email }).exec();
    }

    async removeStoreById(storeId: string) {
        return this.Store.deleteOne({ _id: storeId }).exec();
    }

    async getStoreById(storeId: string) {
        return this.Store.findOne({ _id: storeId }).populate('Store').exec();
    }

    async getStores(limit = 25, page = 0) {
        return this.Store.find()
            .limit(limit)
            .skip(limit * page)
            .exec();
    }

    async updateStoreById(
        storeId: string,
        storeFields: PatchStoreDto | PutStoreDto
    ) {
        const existingStore = await this.Store.findOneAndUpdate(
            { _id: storeId },
            { $set: storeFields },
            { new: true }
        ).exec();

        return existingStore;
    }
}

export default new StoresDao();
