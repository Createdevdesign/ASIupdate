import { GoogleSignInVerification } from "../interfaces";
import debug from 'debug';
import customerService from './customer.service';
import customerDao from '../daos/customer.dao';
import { v4 as uuid } from "uuid";
import jwtMiddleware from "@swiftserve/node-common/dist/middleware/jwt.middleware";
import verifyAppleToken from 'verify-apple-id-token';
import googleAuthService from './googleauth.service';

const ITokenType =  {
  TEMP_STORE_TOKEN:'TEMP_STORE_TOKEN', STORE_TOKEN:'STORE_TOKEN', ANONYMOUS_CUSTOMER_TOKEN:'ANONYMOUS_CUSTOMER_TOKEN', CUSTOMER_TOKEN:'CUSTOMER_TOKEN'
}
const log: debug.IDebugger = debug('app:vonage-service');

class AppleAuthService implements GoogleSignInVerification {
  body: any;
  public setRequestData(authType: string, idToken: string, request: any) {
    this.body = request.body;
    this.body.authType = authType;
    this.body.idToken = idToken;
    this.body.deviceId = request.deviceId;
    this.body.userAgent = request.userAgent;
    this.body.sourceIp = request.sourceIp;
    this.body.clientId = request.clientId;
    this.body.headers = request.headers
  }
  async verifyAuthToken(res:any) {
    try {
      const payload = await verifyAppleToken({
        idToken: this.body.idToken,
        clientId: 'yourAppleClientId',
        //nonce: 'nonce', // optional
      });
      log("Google Authorization response -", payload);
      
      let result: any = await googleAuthService.findVerfiedCustomer(payload, this.body, "AppleAuth");
      if (result === null) {
        return result;
      }
      return result;
    } catch (err) {
      log("Google Authorization failed -", err);
      let result:any =  err;
      return res.status(400).send({errors:[`${result['message']}`]});          
    }
        
  }
}

export default new AppleAuthService();
