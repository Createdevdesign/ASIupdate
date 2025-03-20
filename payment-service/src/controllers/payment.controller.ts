import express from 'express';
import debug from 'debug';
import paymentService from '../services/payment.service';

const log: debug.IDebugger = debug('app:payment-controller');

class PaymentController {
    getCards  = async (req: express.Request, res: express.Response) => {
        let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
        let cards:any = await paymentService.getCardsListUsingCustomerId(customerId);
        return res.status(cards.status).send(cards.message);
        // return res.status(200).send(cards);
    }

    getAttachemtCardUsingPaymentMethod = async (req: express.Request, res: express.Response) => {
        let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
        let attachCard:any = await paymentService.getuserCardAttachData(customerId, req.params.paymentMethodId);
        return res.status(attachCard.status).send(attachCard.message);
    }

    detachUserCard =async (req: express.Request, res: express.Response) => {
        let attachCard:any = await paymentService.detachUserCard(req.params.paymentMethodId);
        return res.status(attachCard.status).send(attachCard.message);
    }

    deletePaymentCards =async (req: express.Request, res: express.Response) => {
        let customerStripeId:any = req.params.customerStripeId;
        let cardId:any = req.params.cardId;
        let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
        let attachCard:any = await paymentService.deletePaymentCards(customerId, customerStripeId, cardId);
        return res.status(attachCard.status).send(attachCard.message);
    }

    createPaymentintentUsingCustomer =async (req: express.Request, res: express.Response) => {
        let headers:any = req.headers;
        let body:any = req.body;
        let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
        let createPaymentIntentdata:any = await paymentService.createPaymentintentUsingCustomer(customerId, body, headers);
        return res.status(createPaymentIntentdata.status).send(createPaymentIntentdata.message);
        // return res.status(200).send(headers);
    }
}

export default new PaymentController();