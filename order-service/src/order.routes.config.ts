import express from 'express';
import { body, header } from 'express-validator';
import { CommonRoutesConfig } from '@swiftserve/node-common';
import OrderController from './controllers/order.controller';
import jwtMiddleware from "@swiftserve/node-common/dist/middleware/jwt.middleware";
import orderMiddleware from './middleware/order.middleware';
import BodyValidationMiddleware from '@swiftserve/node-common/dist/middleware/body.validation.middleware';

export class OrderRoutes extends CommonRoutesConfig {
    app: any;
    constructor(app: express.Application) {
        super(app, 'OrderRoutes');
    }
    configureRoutes(): express.Application {
        
        this.app.route("/api/orders/v1/me")
            .get(
                    jwtMiddleware.storeValidJWTNeeded,
                    orderMiddleware.verifyUser,
                    OrderController.OrderList
                );
        this.app.route("/api/orders/v1/nearby/me")
            .get(
                    header('x-lat').isString(),
                    header('x-long').isString(),
                    header('authorization').isString(),
                    BodyValidationMiddleware.verifyBodyFieldsErrors,
                    jwtMiddleware.storeValidJWTNeeded,
                    orderMiddleware.verifyUser,
                    OrderController.NearByOrderList
                );
                
        this.app.route("/api/orders/v1/me/:orderId")
            .get(
                    header('authorization').isString(),
                    BodyValidationMiddleware.verifyBodyFieldsErrors,
                    jwtMiddleware.storeValidJWTNeeded,
                    orderMiddleware.verifyUser,
                    OrderController.Orderdetail
                )
            .post(
                header('authorization').isString(),
                body('status').isString(),
                // body('expectTime').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                orderMiddleware.verifyStoreUser,
                OrderController.updateOrderStatus
            );

        this.app.route("/api/orders/v1/me/:storeId/reorder/:orderId")
            .post(
                header('authorization').isString(),
                header('x-timezone').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                OrderController.createReorder
            );
        
        return this.app;
    }
}