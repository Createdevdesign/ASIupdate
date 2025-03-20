import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import shortid from 'shortid';
import debug from 'debug';
// import { CreateStoreDto } from '../dto/create.store.dto';
// import { PatchStoreDto } from '../dto/patch.store.dto';
// import { PutStoreDto } from '../dto/put.store.dto';

const log: debug.IDebugger = debug('app:authclient-dao');

class AuthClientDao {
    Schema = mongooseService.getMongoose().Schema;

    authClientSchema = new this.Schema({
        _id: String,
        ClientId: String,
        ClientSecret: String,
        AccessTokenValidity: Number,
        RefreshTokenValidity: Number,
        Active: Boolean,
        TempTokenValidity:Number,
        TokenValidity: Number
    });

    AuthClients = mongooseService.getMongoose().model('AuthClients', this.authClientSchema, 'AuthClients');
    
    constructor() {
        log('Created new instance of StoreDao');
        mongooseService.getMongoose().set('debug', true);
    }

    async getUserClientAndSecretId(clientId: string) {
        return this.AuthClients.findOne({ ClientId: clientId }).exec();
    }
}

export default new AuthClientDao();
