import { Request, Response, NextFunction } from "express";
import  { firebase }  from "../../config/firebase-config";
import * as _ from "lodash";
const db = firebase.firestore();
const Orders = db.collection("orders");

export const getOrders = (req: Request, res: Response, next: NextFunction) => {
    // const orders = Orders.onsnapShot(snapshot => {
    //     console.log(snapshot);
    //     res.render("orders", {title: "Orders"});
    // });
    res.render("orders", {title: "Orders"});
};
export const createOrder = (req: Request, res: Response) => {
    let order = req.body;
    Orders.add(order)
    .then((ref)=>{
        res.json({status: "Order Successful", result: ref});
    })
    .catch((err)=>{
        res.json({status: "Order Failed", error: err});
    })  
};
export const deleteOrder = (req: Request, res: Response) => {
    let id = req.query.id;
    Orders.doc(id).delete()
    .then((ref)=>{
        res.json({status: "Order deleted Successful", result: ref || null});
    })
    .catch((err)=>{
        res.json({status: "Order Failed to delete", error: err});
    })  
};
export const getCustomerOrders = (req: Request, res: Response) => {
    let cno = req.query.qy;
    Orders.where('customer_no', '==', cno || null).where('status', '==', 'pending')
    .get().then((snapshot)=>{
        const orders = [];
        snapshot.forEach(doc => {
           orders.push({id: doc.id, ...doc.data()});
        });

        res.json({status: "Order Retrival Successful", orders});
    })
    .catch((err)=>{
        // console.log(err);
        res.json({status: "Order Retrival Failed", error: err});
    })  
};
export const updateCustomerOrder = (req: Request, res: Response) => {
    const upOrder = req.body.order;
    const id = req.body.id;
    Orders.doc(id).update(upOrder)
    .then((ref)=>{
        res.json({status: "success", msg: "Order Updated Successfully", result: ref});
    })
    .catch((err)=>{
        res.json({status: "failure", msg: "Order update failed", Error: err})
    })
}