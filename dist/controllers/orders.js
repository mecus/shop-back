"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_config_1 = require("../config/firebase-config");
const db = firebase_config_1.firebase.firestore();
const Orders = db.collection("orders");
exports.getOrders = (req, res, next) => {
    // const orders = Orders.onsnapShot(snapshot => {
    //     console.log(snapshot);
    //     res.render("orders", {title: "Orders"});
    // });
    res.render("orders", { title: "Orders" });
};
//# sourceMappingURL=orders.js.map