import { CommonRoutesConfig } from '@swiftserve/node-common/dist/common.routes.config';
import AddressController from './controllers/address.controller';
import AddressMiddleware from './middleware/address.middlleware';
import jwtMiddleware from "@swiftserve/node-common/dist/middleware/jwt.middleware";
import BodyValidationMiddleware from '@swiftserve/node-common/dist/middleware/body.validation.middleware';
import { body, header } from 'express-validator';
import express from 'express';

export class AddressRoutes extends CommonRoutesConfig { 
    constructor(app: express.Application) {
        super(app, 'AddressRoutes');
    }

    configureRoutes(): express.Application {
        this.app.get("/health", (req, res) => {
            res.status(200).send("Healthy");
          });
        
        this.app
            .route(`/api/address-book/v1/addresses`)
            .get(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                AddressController.getAddresses
            )
        this.app
        .route(`/api/address-book/v1/address/:addressId`)
        .get(
            header('authorization').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            AddressController.getAddress
        )
        .put(
            header('authorization').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            AddressController.put, 
        ).delete(
            header('authorization').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            AddressController.deleteAddress
        );
        this.app.post(`/api/address-book/v1/address`, [
            body('Address1').isString(),
            header('authorization').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            AddressController.createAddress
        ]);
        return this.app;        
    }
}
