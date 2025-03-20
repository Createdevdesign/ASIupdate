import { CommonRoutesConfig } from '@swiftserve/node-common';
import authController from './controllers/auth.controller';
import jwtMiddlewares from './middleware/jwt.middleware';
import authMiddleware from './middleware/auth.middleware';
import jwtMiddleware from "@swiftserve/node-common/dist/middleware/jwt.middleware";
import express from 'express';
import { body, header } from 'express-validator';
import BodyValidationMiddleware from '@swiftserve/node-common/dist/middleware/body.validation.middleware';
import authLogController from './controllers/authlog.controller';
import socailAuthController from './controllers/socialauth.controller';

export class AuthRoutes extends CommonRoutesConfig {
    app: any;
    constructor(app: express.Application) {
        super(app, 'AuthRoutes');
    }

    configureRoutes(): express.Application {
        this.app.post(`/auth`, [
            authMiddleware.validateBodyRequest,
            authMiddleware.verifyUserPassword,
            authController.createJWT,
        ]);
        this.app.post(`/api/auth/v1/stores/authenticate`, [
            body('username').isString(),
            body('password').isString(),
            body('notificationId').isString(),
            header('authorization').isString(),
            header('x-device-id').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            authMiddleware.validateClientIdAndSecret,
            authController.verifyCredentials
        ]);
        this.app.post(`/auth/refresh-token`, [
            jwtMiddlewares.validJWTNeeded,
            jwtMiddlewares.verifyRefreshBodyField,
            jwtMiddlewares.validRefreshNeeded,
            authController.createJWT,
        ]);
        this.app.delete(`/api/auth/v1/stores/invalidate`, [
            header('authorization').isString(),
            header('x-device-id').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.invalidJWTNeeded,
            authController.verifyInvalidateCredentials
        ]);
        this.app.post(`/api/auth/v1/stores/access-token`, [
            body('notificationId').isString(),
            header('x-device-id').isString(),
            header('x-store-id').isString(),
            header('authorization').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            authController.verifyAccessTokenCredentials
        ]);
        this.app.post(`/api/auth/v1/stores/refresh-token`, [
            body('refresh_token').isString(),
            body('service').isString(),
            header('x-device-id').isString(),
            header('x-store-id').isString(),
            header('authorization').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.invalidJWTNeeded,
            authMiddleware.verifyService,
            authController.verifyrefreshTokenCredentials
        ]);
        
        this.app.post(`/api/auth/v1/anonymous/authenticate`, [
            header('authorization').isString(),
            header('x-device-id').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            authMiddleware.validateClientIdAndSecret,
            authController.anonymousVerifyCredentials
        ]);
        this.app.post(`/api/auth/v1/authenticate/sms`, [
            header('authorization').isString(),
            header('x-device-id').isString(),
            body('phoneNumber').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            authMiddleware.validateClientIdAndSecret,
            authLogController.sendOTP
        ]);
        
        this.app.post(`/api/auth/v1/verify/sms`, [
            header('x-device-id').isString(),
            body('response_key').isString(),
            body('code').isString(),
            body('notificationId').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            authLogController.smsOtpVerify
        ]);

        
        this.app.post(`/api/auth/v1/me/change-password`, [
            body('newPassword').isString(),
            header('authorization').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            authController.changePassword
        ]);
        this.app.post(`/api/auth/v1/me/reset-password`, [
            body('oldPassword').isString(),
            body('newPassword').isString(),
            header('authorization').isString(),
            header('x-device-id').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            jwtMiddleware.storeValidJWTNeeded,
            authController.resetPassword
        ]);
        this.app.post(`/api/auth/v1/me/forgot-password`, [
            body('username').isString(),
            header('authorization').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            authMiddleware.validateClientIdAndSecret,
            authController.forgotPassword
        ]);
        this.app.post(`/api/auth/v1/me/forgot-password/verify`, [
            body('userCode').isString(),
            body('userName').isString(),
            body('hashKey').isString(),
            header('authorization').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            authMiddleware.validateClientIdAndSecret,
            authController.forgotPasswordOtpVerify
        ]);
        this.app.post(`/api/auth/v1/social/login`, [
            body('idToken').isString(),
            body('authType').isString(),
            body('notificationId').isString(),
            header('authorization').isString(),
            header('x-device-id').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            authMiddleware.validateClientIdAndSecret,
            socailAuthController.socialLoginAuthentication
        ]);
        return this.app;
    }
}
