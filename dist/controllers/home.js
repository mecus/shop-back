"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_config_1 = require("../config/firebase-config");
const db = firebase_config_1.firebase.firestore();
const Products = db.collection("products");
/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
    // console.log(req.user);
    Products.get().then(snapshot => {
        const data = [];
        snapshot.forEach(doc => {
            data.push(Object.assign({}, doc));
        });
        res.render("home", { data });
    }).catch(err => {
        console.log(err);
    });
};
exports.dashboard = (req, res, next) => {
    Products.get().then(snapshot => {
        const data = [];
        snapshot.forEach(doc => {
            data.push(Object.assign({}, doc));
        });
        res.render("dashboard", { data });
    }).catch(err => {
        console.log(err);
    });
};
//# sourceMappingURL=home.js.map