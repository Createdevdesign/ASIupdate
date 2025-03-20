import express from 'express';
import debug from 'debug';
import CartService from '../services/cart.service';

const log: debug.IDebugger = debug('app:cart-controller');
class CartController {

    async getCustomerCartData(
        req: express.Request,
        res: express.Response,
    ) {
        let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
        let finalData:any = await CartService.getCustomerCartList(customerId, req.params.storeId, req.query)
        return res.status(finalData.status).send(finalData.message);
    }

    async createCartItems(
        req: express.Request,
        res: express.Response,
    ) {
        let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
        let finalData:any = await CartService.createCart(customerId, req.params.storeId, req.body)
        return res.status(finalData.status).send(finalData.message);
    }
    async updateCartItem(
        req: express.Request,
        res: express.Response,
    ) {
        let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
        let finalData:any = await CartService.updateCart(customerId, req.params.storeId,req.params.cartId, req.body)
        return res.status(finalData.status).send(finalData.message);
    }

    
    async deleteCartItem(
        req: express.Request,
        res: express.Response,
    ) {
        let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
        let finalData:any = await CartService.deleteMyCartitems(customerId, req.params.storeId,req.params.cartId)
        return res.status(finalData.status).send(finalData.message);
    }
}

export default new CartController();
