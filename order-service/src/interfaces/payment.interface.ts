export interface PaymentServices {
    paymentRefund: (ChargeId:string, orderNumber: number, res:any) => Promise<any>;
    paymentCapture: (ChargeId:string, res:any) => Promise<any>;
    paymentConformUsingPaymentIntentMethod:(PaymentIntentId:string, res:any)=> Promise<any>;
}