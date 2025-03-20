import { CommonRoutesConfig } from '@swiftserve/node-common';
import CartController from './controllers/cart.controller';
import express from 'express';
import jwtMiddleware from "@swiftserve/node-common/dist/middleware/jwt.middleware";
import { header, body } from 'express-validator';
import BodyValidationMiddleware from '@swiftserve/node-common/dist/middleware/body.validation.middleware';

export class CartRoutes extends CommonRoutesConfig {
    app: any;
    constructor(app: express.Application) {
        super(app, 'CartRoutes');
    }

    configureRoutes(): express.Application {
        this.app.route(`/api/carts/v1/me/:storeId`)
            .get(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                CartController.getCustomerCartData
            ).post(
                header('authorization').isString(),
                body('Attributes').isObject(),
                body('ShoppingCartType').isNumeric(),
                body('ShoppingCartTypeId').isNumeric(),
                body('ProductId').isString(),
                body('Quantity').isNumeric(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                CartController.createCartItems
            );            

            this.app.route(`/api/carts/v1/me/:storeId/item/:cartId`)
            .put(
                header('authorization').isString(),
                body('Attributes').isObject(),
                body('ShoppingCartType').isNumeric(),
                body('ShoppingCartTypeId').isNumeric(),
                body('ProductId').isString(),
                body('Quantity').isNumeric(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                CartController.updateCartItem
            ).delete(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                CartController.deleteCartItem
            );
        return this.app;
    }
}
