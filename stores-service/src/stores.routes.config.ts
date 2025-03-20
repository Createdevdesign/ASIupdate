import { CommonRoutesConfig } from '@swiftserve/node-common/dist/common.routes.config';
import StoresController from './controllers/stores.controller';
import StoresMiddleware from './middleware/stores.middleware';
import jwtMiddleware from "@swiftserve/node-common/dist/middleware/jwt.middleware";
import permissionMiddleware from '@swiftserve/node-common/dist/middleware/common.permission.middleware';
import { PermissionLevel } from '@swiftserve/node-common';
import BodyValidationMiddleware from '@swiftserve/node-common/dist/middleware/body.validation.middleware';
// import headersMiddleware from '@swiftserve/node-common/dist/middleware/headers.middleware'
import { body, header, query } from 'express-validator';

import express from 'express';

export class StoresRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'StoresRoutes');
    }

    configureRoutes(): express.Application {
        this.app
            .route(`/api/stores/v1`)
            .get(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                // headersMiddleware.validRequiredHeaders,
                //headersMiddleware.validCoordinates,
                //permissionMiddleware.onlyAdminCanDoThisAction,
                StoresController.listStores
            )
            .post(
                StoresMiddleware.validateRequiredStoreBodyFields,
                StoresMiddleware.validateSameStoreDoesntExist,
                StoresController.createStore
            );

        this.app.param(`storeId`, StoresMiddleware.extractStoreId);
        this.app
            .route(`/api/stores/v1/:storeId`)
            .all(
                jwtMiddleware.storeValidJWTNeeded,
               // permissionMiddleware.onlySameUserOrAdminCanDoThisAction
            )
            .get(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                StoresController.getStoreById)
            .delete(StoresController.removeStore);

        this.app.put(`/api/stores/:storeId`, [
            //jwtMiddleware.validJWTNeeded,
            body('name').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            permissionMiddleware.onlySameUserOrAdminCanDoThisAction,
            permissionMiddleware.minimumPermissionLevelRequired(
                PermissionLevel.PAID_PERMISSION
            ),
            StoresController.put,
        ]);

        this.app.patch(`/api/stores/:storeId`, [
            //jwtMiddleware.validJWTNeeded,
            body('name').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            permissionMiddleware.onlySameUserOrAdminCanDoThisAction,
            permissionMiddleware.minimumPermissionLevelRequired(
                PermissionLevel.PAID_PERMISSION
            ),
            StoresController.patch,
        ]);

        this.app
            .route(`/api/stores/v1/:storeId/promotions`)
            .all(
                jwtMiddleware.storeValidJWTNeeded
            )
            .get(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                StoresController.getStorePromotionList
            );

        this.app
            .route(`/api/stores/v1/:storeId/hours`)
            .all(
                jwtMiddleware.storeValidJWTNeeded
            )
            .get(
                header('authorization').isString(),
                header('x-timezone').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                StoresController.getStoreHours
            );
            this.app.get("/api/stores/v1/me/recents",[
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                
                jwtMiddleware.storeValidJWTNeeded,
                StoresController.getRecentCarts]
            );
            this.app.get("/api/stores/v1/activeStore/:activeId",[
                StoresController.getActivateStore
                ]
            );
            
            this.app.post("/api/stores/v1/feedback/:storeId",[
                    header('authorization').isString(),
                    body('type').isString(),
                    body('message').isString(),
                    BodyValidationMiddleware.verifyBodyFieldsErrors,
                    jwtMiddleware.storeValidJWTNeeded,
                    StoresController.createFeedback
                ]
            );

            this.app.route("/api/stores/v1/:storeId/assets")
                .post(
                        header('authorization').isString(),
                        query('type').isString(),
                        BodyValidationMiddleware.verifyBodyFieldsErrors,
                        jwtMiddleware.storeValidJWTNeeded,
                        StoresMiddleware.verifyUser,
                        StoresController.uploadStoreAssets
                ).delete(
                    header('authorization').isString(),
                    query('type').isString(),
                    body('image').isString(),
                    BodyValidationMiddleware.verifyBodyFieldsErrors,
                    jwtMiddleware.storeValidJWTNeeded,
                    StoresController.deleteStoreAssetData
                );
                this.app.route("/api/stores/v1/me/stateProvincess")
                .get(
                    header('authorization').isString(),
                    BodyValidationMiddleware.verifyBodyFieldsErrors,
                    jwtMiddleware.storeValidJWTNeeded,
                    StoresController.getStateProvincess
                );

                this.app.route("/api/stores/v1/:storeId/hours/")
                .post(
                        header('authorization').isString(),
                        header('x-timezone').isString(),
                        BodyValidationMiddleware.verifyBodyFieldsErrors,
                        jwtMiddleware.storeValidJWTNeeded,
                        StoresMiddleware.verifyUser,
                        StoresController.updateStoreHours
                )

                this.app.route("/api/stores/v1/qrcode/:extId")
                .get(
                    header('authorization').isString(),
                    BodyValidationMiddleware.verifyBodyFieldsErrors,
                    jwtMiddleware.storeValidJWTNeeded,
                    StoresController.scanQrCode
                );
        return this.app;
    }
}
