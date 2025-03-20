import { CommonRoutesConfig } from '@swiftserve/node-common/dist/common.routes.config';
import StoresController from './controllers/stores.controller';
import InventoryMiddleware from './middleware/inventory.middleware';
import jwtMiddleware from "@swiftserve/node-common/dist/middleware/jwt.middleware";
import permissionMiddleware from '@swiftserve/node-common/dist/middleware/common.permission.middleware';
import { PermissionLevel } from '@swiftserve/node-common';
import BodyValidationMiddleware from '@swiftserve/node-common/dist/middleware/body.validation.middleware';
import headersMiddleware from '@swiftserve/node-common/dist/middleware/headers.middleware'
import { body, header } from 'express-validator';
import InventoryController from './controllers/inventory.controller';
import SpecificationAttributesController from './controllers/specificationAttributes.controller';
import InventoryCategoriesController from './controllers/inventoryCategories.controller';
import express from 'express';

export class StoresRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'StoresRoutes');
    }

    configureRoutes(): express.Application {
        this.app.get("/health", (req, res) => {
            res.status(200).send("Healthy");
          });
        this.app
            .route(`/stores`)
            .get(
                jwtMiddleware.validJWTNeeded,
                headersMiddleware.validRequiredHeaders,
                //headersMiddleware.validCoordinates,
                //permissionMiddleware.onlyAdminCanDoThisAction,
                StoresController.listStores
            )
            .post(
                InventoryMiddleware.validateRequiredStoreBodyFields,
                InventoryMiddleware.validateSameStoreDoesntExist,
                StoresController.createStore
            );

        this.app.param(`storeId`, InventoryMiddleware.extractStoreId);
        this.app
            .route(`/stores/:storeId`)
            .all(
                jwtMiddleware.validJWTNeeded,
                headersMiddleware.validRequiredHeaders,
               // permissionMiddleware.onlySameUserOrAdminCanDoThisAction
            )
            .get(StoresController.getStoreById)
            .delete(StoresController.removeStore);

        this.app.put(`/stores/:storeId`, [
            //jwtMiddleware.validJWTNeeded,
            body('name').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            permissionMiddleware.onlySameUserOrAdminCanDoThisAction,
            permissionMiddleware.minimumPermissionLevelRequired(
                PermissionLevel.PAID_PERMISSION
            ),
            StoresController.put,
        ]);

        this.app.patch(`/stores/:storeId`, [
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
            .route(`/api/inventory/v1/:storeId/products`)
            .get(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                InventoryController.listInventorys
            ).post(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                InventoryMiddleware.verifyUser,
                InventoryController.createInventory,
            );
        
        this.app
            .route(`/api/inventory/v1/products/specification-attributes`)
            .get(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                SpecificationAttributesController.listSpeicificationAttributes
            )
        this.app
            .route(`/api/inventory/v1/:storeId/product-attributes`)
            .get(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                InventoryMiddleware.verifyUser,
                InventoryController.listInventoryAttributes
            )

            
        this.app
        .route(`/api/inventory/v1/:storeId/products/:productId`)
        .get(
            header('authorization').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            InventoryController.getInventory
        ).put(
            header('authorization').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            InventoryMiddleware.verifyUser,
            InventoryController.createInventory,
        );
        this.app
        .route(`/api/inventory/v1/:storeId/categories`)
        .post(
            header('authorization').isString(),
            body('name').isString(),
            body('seName').isString(),
            body('description').isString(),
            body('published').isBoolean(),
            body('limitedToStores').isBoolean(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            InventoryMiddleware.verifyUser,
            InventoryCategoriesController.createInventoryCategories
        );

        this.app
        .route(`/api/inventory/v1/:storeId/categories/:categoryId`)
        .put(
            header('authorization').isString(),
            body('name').isString(),
            body('seName').isString(),
            body('description').isString(),
            body('published').isBoolean(),
            body('limitedToStores').isBoolean(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            InventoryMiddleware.verifyUser,
            InventoryCategoriesController.updateInventoryCategories
        );

        this.app
        .route(`/api/inventory/v1/:storeId/products/:productId/attributes/:attributeId`)
        .put(
            header('authorization').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            InventoryMiddleware.verifyUser,
            InventoryController.updateProductAttributes
        );

        this.app
        .route(`/api/inventory/v1/:storeId/inventory/:inventoryId/assets`)
        .post(
            header('authorization').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            InventoryMiddleware.verifyUser,
            InventoryController.uploadInventoryAssets
        );

        this.app
        .route(`/api/inventory/v1/:storeId/inventory/:inventoryId/assets/:assetId`)
        .put(
            header('authorization').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            InventoryMiddleware.verifyUser,
            InventoryController.updateInventoryAsset
        ).delete(
            header('authorization').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            InventoryMiddleware.verifyUser,
            InventoryController.deleteInventoryAsset
        );
        return this.app;
    }
}
