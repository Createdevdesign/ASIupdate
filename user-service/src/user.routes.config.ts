import { CommonRoutesConfig } from '@swiftserve/node-common';
import userController from './controllers/user.controller';
import express from 'express';
import jwtMiddleware from "@swiftserve/node-common/dist/middleware/jwt.middleware";
import { header, body } from 'express-validator';
import BodyValidationMiddleware from '@swiftserve/node-common/dist/middleware/body.validation.middleware';
import userMiddleware from './middleware/user.middleware';

export class AuthRoutes extends CommonRoutesConfig {
    app: any;
    constructor(app: express.Application) {
        super(app, 'AuthRoutes');
    }

    configureRoutes(): express.Application {
        this.app.route(`/api/users/v1/me`)
            .get(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                userController.getCustomerData
            ).put(
                header('authorization').isString(),
                body('firstName').isString(),
                body('lastName').isString(),
                body('displayName').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                userController.updateUser
            );
        this.app.route(`/api/users/v1/me/preferences`)
            .get(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                userController.getCustomerPreferedNotification
            ).post(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                userController.updateCustomerPreferedNotification
        );
        this.app.route(`/api/users/v1/me/rating`)
            .post(
                header('authorization').isString(),
                body('storeId').isString(),
                body('ratings').isNumeric(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                userController.createUserRating
        );
        this.app.route(`/api/users/v1/employee`)
            .post(
                header('authorization').isString(),
                body('firstName').isString(),
                body('lastName').isString(),
                body('userName').isString(),
                body('displayName').isString(),
                body('email').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                userMiddleware.verifyUser,
                userController.createEmployee
        );
        this.app.route(`/api/users/v1/me/asset`)
            .post(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                userController.uploadUserImage
        );
        this.app.route(`/api/users/v1/me/email`)
            .put(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                userController.updateEmailForCustomer
            );
            this.app.route(`/api/users/v1/me/feedback`)
            .post(
                header('authorization').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.storeValidJWTNeeded,
                userController.createOrUpdateFeedback
            );
            this.app.route(`/api/users/v2/me/VerifyEmail`)
            .get(
                userController.verifyEmail
        );
            
        return this.app;
    }
}
