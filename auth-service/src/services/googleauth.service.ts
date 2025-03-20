import { GoogleSignInVerification } from "../interfaces";
import debug from 'debug';
import { OAuth2Client } from "google-auth-library";
import customerService from '../services/customer.service';
import customerDao from '../daos/customer.dao';
import { v4 as uuid } from "uuid";
import jwtMiddleware from "@swiftserve/node-common/dist/middleware/jwt.middleware";

const ITokenType =  {
  TEMP_STORE_TOKEN:'TEMP_STORE_TOKEN', STORE_TOKEN:'STORE_TOKEN', ANONYMOUS_CUSTOMER_TOKEN:'ANONYMOUS_CUSTOMER_TOKEN', CUSTOMER_TOKEN:'CUSTOMER_TOKEN'
}
const log: debug.IDebugger = debug('app:vonage-service');

class GoogleAuthService implements GoogleSignInVerification {
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
      const client = new OAuth2Client();
      const ticket = await client.verifyIdToken({
        idToken: this.body.idToken,
      });
      const payload = ticket.getPayload();
      log("Google Authorization response -", payload);

      let result: any = await this.findVerfiedCustomer(payload, this.body, "Google");
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

  public async findVerfiedCustomer(authData: any, body: any, authType: any): Promise<any> {

      authData.email = authData.email && (authData.email).toLowerCase() || "";
      log("Verifying refresh token id for email - ",  authData.email);
      const customer: any = await customerService.findCustomerUsingEmail(authData.email);;
      if (!customer) {
        return null;
      }
      if (!customer.AuthorizedStores.length) {
        return null
      }
      let customerData: any = [];
      await customerDao.updateCustomer(customer);
      customerData = customer;
  
      let customerBase64Id = Buffer.from(customerData._id).toString("base64");
      let clientBase64Id = Buffer.from(body.clientId).toString("base64");
      var time = new Date();
      let customerRoles:any = [];
      customerData.CustomerRoles.filter(data =>  customerRoles.push(data.Name))
  
      const payload = {
        jti: uuid(),
        sub: customerBase64Id,
        clientId: clientBase64Id,
        DeviceId: body.deviceId,
        unique_name: customerData.Username,
        issuer: process.env.access_token_issuer,
        issued_date: time.getMilliseconds().toString(),
        expires_in: time.getMilliseconds().toString(),
        role: "Customer"
      };
  
      const refreshToken = payload.jti;
      await customerService.gmailStoreTokenInfo(
        payload,
        customer._id,
        authData.sub,
        body.headers,
        body.notificationId,
        ITokenType.STORE_TOKEN,
        refreshToken,
        body.clientData,
        authType
    );
      log("Google And Apple Auth Verification Complete.");
      const token: string = await jwtMiddleware.createToken(payload, 1800);
      let responseData:any = {
        access_token: token,
        //refresh_token: refreshToken,
        displayName: customerData.DisplayName === undefined || customerData.DisplayName === "" ? null : customerData.DisplayName,
        customerId: customerData._id,
        email: customerData.Email === "" ? null : customerData.Email
      }
      if(authType === "Apple" || authType === "AppleAuth"){
        responseData.refresh_token= refreshToken;
      }
      return responseData;
    }
}

export default new GoogleAuthService();
