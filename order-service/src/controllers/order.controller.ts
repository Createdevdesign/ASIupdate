import express from 'express';
import debug from 'debug';
import orderService from '../services/order.service';

const log: debug.IDebugger = debug('app:order-controller');

class OrderController{
   OrderList  = async (req: express.Request, res: express.Response) => {
       try {
        let storeId:any;
        let statusCounts:any;
        if(req.query && req.query.statuses){
            var statusData:any = req.query.statuses;
            var statusArray:any=statusData.split(',');
        }
        if(res.locals.jwt.storeId){
            storeId = res.locals.jwt.storeId;
            statusCounts = false;
        }
        let orderList:any;
        let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
        if(storeId){
            orderList = await orderService.orderListByStoreId(storeId, req.query, statusArray, statusCounts)
            // orderList = storeId;
        }else{
            orderList = await orderService.orderListByCustomerId(customerId, req.query, statusArray, statusCounts)
            // orderList=customerId;
        }
        return res.status(200).send(orderList);
       } catch (error) {
        return res.status(400).send(error);
       }
   }

   NearByOrderList  = async (req: express.Request, res: express.Response) => {
    try {
     let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
     let headers:any = req.headers;
     let orderList:any = await orderService.nearByOrderListByCustomerId(customerId, 
        headers['x-lat'],
        headers['x-long'])
     return res.status(200).send(orderList);
    } catch (error) {
     return res.status(400).send(error);
    }
    }

    Orderdetail  = async (req: express.Request, res: express.Response) => {
        try {
            let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
            let orderId:any = req.params.orderId;
            let storeId:any;
            if(res.locals.jwt.storeId){
                storeId = res.locals.jwt.storeId;
            }
            let orderDetail:any;
            if(storeId){
                orderDetail = await orderService.getStoreOrderDetail(storeId,orderId, res);
                // orderList = storeId;
            }else{
                orderDetail = await orderService.getCustomerOrderDetail(customerId,orderId, res);
            }
            return res.status(200).send({data:orderDetail});
        } catch (error) {
         return res.status(400).send(error);
        }
        }

    updateOrderStatus  = async (req: express.Request, res: express.Response) => {
            try {
                let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
                let orderId:any = req.params.orderId;
                let storeId:any =res.locals.jwt.storeId;
                let orderList:any = await orderService.updateOrderStatus(req.body, storeId,orderId, customerId, res);
                return res.status(200).send(orderList);
            } catch (error) {
             return res.status(400).send(error);
            }
    }

    createReorder  = async (req: express.Request, res: express.Response) => {
        try {
            let customerId:string=Buffer.from(res.locals.jwt.sub, "base64").toString();
            let orderId:any = req.params.orderId;
            let storeId:any =req.params.storeId;
            let headers:any= req.headers;
            let orderList:any = await orderService.createCustomerReOrder(customerId,storeId,orderId,headers, res);
            return res.status(200).send(orderList);
        } catch (error) {
         return res.status(400).send(error);
        }
}
}

export default new OrderController();