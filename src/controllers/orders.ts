import { Request, Response, NextFunction } from "express";
import  { firebase }  from "../config/firebase-config";
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
