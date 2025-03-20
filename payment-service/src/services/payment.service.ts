import debug from 'debug';
import customerlogDao from '../daos/customerlog.dao';
import priceService from './price.service';

const log: debug.IDebugger = debug('app:payment-service');

class PaymentService{

    getCardsListUsingCustomerId =async (customerId:string) => {
        let cusotmerStripeId:any = await customerlogDao.findCustomerUsingCustomerId(customerId);
        if (!cusotmerStripeId) {
            cusotmerStripeId = await priceService.createStripeCustomerusingCustomerId(customerId);
            if(cusotmerStripeId.status){
                return cusotmerStripeId
            }
            await customerlogDao.createStripeIdInCustomerCollection(customerId, cusotmerStripeId);
            // return {status:400, message:{errors:["stripe customer id not found"]}}
        }
        let getCustomerpaymentCards:any = await priceService.getCustomerCardsUsingCustomerEmail(cusotmerStripeId);
        if (!getCustomerpaymentCards) {
            return {status:400, message:{errors:["get Customer payment card error"]}}
        }
        return getCustomerpaymentCards
    }

    getuserCardAttachData =async (customerId:string, paymentMethodId:any) => {
        let cusotmerStripeId:any = await customerlogDao.findCustomerUsingCustomerId(customerId);
        if (!cusotmerStripeId) {
            return {status:400, message:{errors:["stripe customer id not found"]}}
        }
        log("attach user payment card to payment method" + paymentMethodId);
        let getCustomerpaymentCards:any = await priceService.getAttachmentCardusingPaymentMethod(cusotmerStripeId, paymentMethodId);
        if (!getCustomerpaymentCards) {
            return {status:400, message:{errors:["get user payment card error"]}}
        }
        return getCustomerpaymentCards
    }

    detachUserCard =async (paymentMethodId:any) => {
        let getDetachpaymentCards:any = await priceService.detachmentCardusingPaymentMethod(paymentMethodId);
        if (!getDetachpaymentCards) {
            return {status:400, message:{errors:["detach card error"]}}
        }
        return getDetachpaymentCards;
    }
    deletePaymentCards =async (customerId:string, paymentCustomerId: string, cardId: string) => {
        log("delete customer card" + customerId);
        let deletePaymentCards:any = await priceService.deletePaymentCard(paymentCustomerId, cardId);
        if (!deletePaymentCards) {
            return {status:404, message:{errors:["delete Customer payment card error"]}}
        }
        return deletePaymentCards;   
    }

    createPaymentintentUsingCustomer =async (customerId:string, body:any, headers:any) => {
        log("Caalculating total", customerId);
        body.isTaxRequired=true;
        let calculateTotal:any = await customerlogDao.customerCalculateTotalData(body, headers);
        if(calculateTotal.status !== 200 || calculateTotal.statusCode !== 200){
          return {status:calculateTotal.status === undefined?calculateTotal.statusCode:calculateTotal.status, message: {errors:[calculateTotal.body === undefined?"H":calculateTotal.body.message]}}
        }
      
        let totalAmount = calculateTotal.body.totalAmount;
        if(body.TipAmount){
            totalAmount = calculateTotal.body.totalAmount + parseFloat(body.TipAmount);
        }
        
        log("verifying payment method type");
        let paymentCard: Boolean = body.PaymentMethodType.includes('GooglePay') || body.PaymentMethodType.includes('ApplePay') || body.PaymentMethodType.includes('Card')
        if(!paymentCard){
            return {status:400, message:{errors:["Payment method type is not allowed"]}};
        }
        
        
        log("calculate total amount " + totalAmount);
        log("Verifying stripe Id in customer collection " + calculateTotal);
        let cusotmerStripeId:any = body.AppType === "Store"? body.CustomerSID:await customerlogDao.findCustomerUsingCustomerId(customerId);
        if(body.AppType === "Store"){
            if(cusotmerStripeId === "" || cusotmerStripeId === null || cusotmerStripeId === undefined){
              cusotmerStripeId = "No Customer";
            }
            if((cusotmerStripeId === "" || cusotmerStripeId === null || cusotmerStripeId === undefined)
              && 
              (body.CustomerId !== "" || body.CustomerId !== null || body.CustomerId !== undefined)
              ){
                cusotmerStripeId = await priceService.createStripeCustomerusingCustomerId(body.CustomerId);
                if(cusotmerStripeId.status){
                    return cusotmerStripeId
                }
                await customerlogDao.createStripeIdInCustomerCollection(body.CustomerId, cusotmerStripeId);
            }
          }else{
            if (!cusotmerStripeId) {
              cusotmerStripeId = await priceService.createStripeCustomerusingCustomerId(customerId);
              if(cusotmerStripeId.status){
                return cusotmerStripeId
              }
              await customerlogDao.createStripeIdInCustomerCollection(customerId, cusotmerStripeId);
            }
        }
          
        log("payment customer strie id " + cusotmerStripeId);
        let createPayMentIntent = await priceService.createPaymentIntentusingCustomerIdandAmount(cusotmerStripeId, body, totalAmount);
        if(createPayMentIntent.message){
            return createPayMentIntent;
        }
        return {status:200, message:createPayMentIntent};
    }
}

export default new PaymentService();