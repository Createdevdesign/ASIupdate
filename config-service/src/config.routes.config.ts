import { CommonRoutesConfig } from '@swiftserve/node-common/dist/common.routes.config';
import ConfigurationController from './controllers/config.controller';
import ConfigMiddleware from './middleware/config.middleware';

import jwtMiddleware from "@swiftserve/node-common/dist/middleware/jwt.middleware";
import BodyValidationMiddleware from '@swiftserve/node-common/dist/middleware/body.validation.middleware';
import { body, header } from 'express-validator';
import express from 'express';

export class ConfigRoutes extends CommonRoutesConfig { 
    constructor(app: express.Application) {
        super(app, 'ConfiguarationRoutes');
    }

    configureRoutes(): express.Application {
        this.app.get("/health", (req, res) => {
            res.status(200).send("Healthy");
          });
        
         
        this.app
        .route(`/api/configs/v1`)
        .get(
            header('authorization').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            ConfigurationController.getConfigs
        )
        .post(
            header('authorization').isString(),
            body('Name').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            ConfigurationController.createConfigInfo
        )
        this.app
        .route(`/api/configs/v1/name/:name`)
        .get(
            header('authorization').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            ConfigurationController.getConfigInfo
        )
        .put(
            header('authorization').isString(),
            body('Name').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            ConfigurationController.updateConfigInfo
        )
        .delete(
            header('authorization').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            ConfigurationController.deleteConfigInfo
        )
        this.app
            .route(`/api/configs/v1/stores`)
            .get(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                ConfigurationController.getStoreConfigs
            )
        
        this.app
            .route(`/api/configs/v1/store/:storeId`)
            .post(
                header('authorization').isString(),
                body('Name').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                ConfigurationController.createStoreConfigInfo
            )
        this.app
            .route(`/api/configs/v1/store/:storeId/name/:name`)
            .get(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                ConfigurationController.getStoreConfigInfo
            )
            .put(
                header('authorization').isString(),
                body('Name').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                // ConfigMiddleware.validateBodyRequest,
                ConfigurationController.updateStoreConfigInfo
            )
            .delete(
                header('authorization').isString(),
                // BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                ConfigurationController.deleteStoreConfigInfo
            )
        
        return this.app;        
    }
}
