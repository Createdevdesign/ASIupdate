import express from 'express';
import addressService from '../services/address.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:stores-controller');

class AddressController {
    async getAddresses(req: express.Request, res: express.Response) {
        let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
        const addresses = await addressService.getAddresses(customerId);
        console.log("Here");
        return res.status(addresses.status).send(addresses.message);
    }

    async getAddress(req: express.Request, res: express.Response) {
        let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
        const address: any = await addressService.getAddress(customerId, req.params.addressId);
             console.log("Here");
            return res.status(address.status).send(address.message);
        }

    async deleteAddress(req: express.Request, res: express.Response) {
            let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
            const deleteAddress = await addressService.deleteAddress(customerId, req.params.addressId);
            if(deleteAddress.message === true){
                return res.status(deleteAddress.status).send();
            }else{
                return res.status(deleteAddress.status).send(deleteAddress.message);
            }
        }

    // async getStoreById(req: express.Request, res: express.Response) {
    //     const store = await storesService.readById(req.params.storeId);
    //     res.status(200).send(store);
    // }

    async createAddress(req: express.Request, res: express.Response) {
        let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
        const createAddress = await addressService.createAddress(req.body, customerId);
        if(createAddress.message === true){
            return res.status(createAddress.status).send();
        }else{
            return res.status(createAddress.status).send(createAddress.message);
        }
        // res.status(201).send({ id: addressId });
        res.status(201).send();
    }

    // async patch(req: express.Request, res: express.Response) {
    //     log(await storesService.patchById(req.params.storeId, req.body));
    //     res.status(204).send();
    // }

    async put(req: express.Request, res: express.Response) {
        let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
        let addressId = req.params.addressId;
        let updateAddress = await addressService.updateAddress( req.body, customerId, addressId);
        if(updateAddress.message === true){
            return res.status(updateAddress.status).send();
        }else{
            return res.status(updateAddress.status).send(updateAddress.message);
        }
    }

    // async removeStore(req: express.Request, res: express.Response) {
    //     log(await storesService.deleteById(req.params.storeId));
    //     res.status(204).send();
    // }
}

export default new AddressController();
