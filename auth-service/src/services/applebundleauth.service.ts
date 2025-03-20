import { GoogleSignInVerification, IOS_BUNDLE_ID, APPLE_IDENTITY_URL } from "../interfaces";
import debug from 'debug';
import verifyAppleToken from 'verify-apple-id-token';
import googleAuthService from './googleauth.service';
import * as jwt from 'jsonwebtoken';
import NodeRSA from 'node-rsa';
import request from "request-promise";
import moment from "moment";

const ITokenType =  {
  TEMP_STORE_TOKEN:'TEMP_STORE_TOKEN', STORE_TOKEN:'STORE_TOKEN', ANONYMOUS_CUSTOMER_TOKEN:'ANONYMOUS_CUSTOMER_TOKEN', CUSTOMER_TOKEN:'CUSTOMER_TOKEN'
}
const log: debug.IDebugger = debug('app:vonage-service');

class AppleBundleAuthService implements GoogleSignInVerification {
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
      const payload = await this.validateIdentityToken(this.body.idToken, res);
      log("Google Authorization response -", payload);
      
      let result: any = await googleAuthService.findVerfiedCustomer(payload, this.body, "Apple");
      if (result === null) {
        return res.status(403).send({errors:["Please reach out to the your manager for access"]});
      }
      return result;
    } catch (err) {
      log("Google Authorization failed -", err);
      let result:any =  err;
      return res.status(400).send({errors:[`${result['message']}`]});          
    }
        
  }
  private async validateIdentityToken(identityToken: string, res:any): Promise<any> {
    try {
      const clientID = IOS_BUNDLE_ID;
      const { header }:any = jwt.decode(identityToken, { complete: true });
      const applePublicKey = await this.getAppleIdentityPublicKey(header.kid);
      const jwtClaims : any = jwt.verify(identityToken, applePublicKey, { algorithms: ['RS256'] });
      if (jwtClaims.iss !== APPLE_IDENTITY_URL) return res.status(400).send({errors:[`Apple identity token wrong issuer: ${jwtClaims.iss}`]});
      if (jwtClaims.aud !== clientID) return res.status(400).send({errors:[`Apple identity token wrong audience:  ${jwtClaims.aud}`]});
      if (jwtClaims.exp < moment.utc().unix()) return res.status(400).send({errors:[`Apple identity token expired`]});;
      return jwtClaims;
    } catch (err) {
      log("Apple Identity Validation Error -", err);
      let result:any =  err;
      return res.status(400).send({errors:[`${result['message']}`]});   
    }
  }

  private async getAppleIdentityPublicKey(kid: any): Promise<any> {
    const url = APPLE_IDENTITY_URL + '/auth/keys';
    const data = await request({ url, method: 'GET' });
    const keys = JSON.parse(data).keys;
    const key = keys.find(k => k.kid === kid);
    const pubKey = new NodeRSA();
    pubKey.importKey({ n: Buffer.from(key.n, 'base64'), e: Buffer.from(key.e, 'base64') }, 'components-public');
    return pubKey.exportKey('public');
  };
}

export default new AppleBundleAuthService();
