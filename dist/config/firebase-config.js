"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const serviceAccount = require("../../firebase-adminsdk.json");
exports.firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://shop-5e89b.firebaseio.com"
    // databaseAuthVariableOverride: undefined
});
exports.authenticate = (req, res, next) => {
    if (!req.session || !req.session.uid) {
        return res.redirect("/login");
    }
    next();
};
// const config = {
//     apiKey: "AIzaSyC3PouxaTBLmR1R2YhHKTR9dldzLGhCXwA",
//     authDomain: "shop-5e89b.firebaseapp.com",
//     databaseURL: "https://shop-5e89b.firebaseio.com",
//     projectId: "shop-5e89b",
//     storageBucket: "shop-5e89b.appspot.com",
//     messagingSenderId: "777977280371"
// };
// export const firebaseClient = firebase.initializeApp(config); 
//# sourceMappingURL=firebase-config.js.map