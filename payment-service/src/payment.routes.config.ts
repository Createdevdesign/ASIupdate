import express from 'express';
import { body, header } from 'express-validator';
import { CommonRoutesConfig } from '@swiftserve/node-common';
import BodyValidationMiddleware from '@swiftserve/node-common/dist/middleware/body.validation.middleware';
import paymentController from './controllers/payment.controller';
import jwtMiddleware from "@swiftserve/node-common/dist/middleware/jwt.middleware";

export class PaymentRoutes extends CommonRoutesConfig {
    app: any;
    constructor(app: express.Application) {
        super(app, 'PaymentRoutes');
    }
    configureRoutes(): express.Application {
        
        this.app.route("/api/payments/v1/payment-methods")
            .get(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                paymentController.getCards
            );
        this.app.route("/api/payments/v1/payment-methods/:paymentMethodId")
            .post(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                paymentController.getAttachemtCardUsingPaymentMethod
            ).delete(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                paymentController.detachUserCard
            );
        this.app.route("/api/payments/v1/:customerStripeId/card/:cardId")
            .delete(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                paymentController.deletePaymentCards
            );
        this.app.route("/api/payments/v1/payment-intent")
                .post(
                    header('authorization').isString(),
                    BodyValidationMiddleware.verifyBodyFieldsErrors,
                    jwtMiddleware.storeValidJWTNeeded,
                    paymentController.createPaymentintentUsingCustomer
                );
        
        return this.app;
    }
}