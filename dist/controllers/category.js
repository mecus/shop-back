"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_config_1 = require("../config/firebase-config");
const imageMag_1 = require("./imageMag");
const db = firebase_config_1.firebase.firestore();
// Creating ref for Aisle and Category
const ProductRef = db.collection("products");
exports.getCategory = (req, res, next) => {
    const params = req.query;
    const dbRef = db.collection("category");
    const cat = dbRef.where("aisle_id", "==", params.aisle_id);
    cat.onSnapshot(snapshot => {
        const data = snapshot.docs;
        if (data) {
            res.render("store/category", { params, data, title: "Categories" });
        }
        else {
            dbRef.onSnapshot(snapshot => {
                const data = snapshot.docs;
                if (data) {
                    res.render("store/category", { params, data, title: "Categories" });
                }
            });
        }
    });
};
exports.postCategory = (req, res, next) => {
    const data = {
        name: req.body.name,
        group: req.body.group,
        aisle_id: req.body.aisle_id,
        department_id: req.body.department_id
    };
    const dbRef = db.collection("category");
    dbRef.add(data).then(ref => {
        if (ref) {
            res.redirect(`/category/?aisle_id=${req.body.aisle_id}&department_id=${req.body.department_id}`);
        }
        else {
            res.redirect("/department");
        }
    }).catch(err => {
        next(err);
    });
};
exports.removeCategory = (req, res, next) => {
    const paramsId = req.params.id;
    const dbRef = db.collection("category").doc(paramsId);
    // res.json({id: paramsId});
    if (paramsId) {
        batchProduct(paramsId);
        dbRef.delete().then(ref => {
            res.json({ id: paramsId });
        }).catch(err => {
            res.status(500);
            next(err);
        });
    }
    else {
        res.redirect("/department");
    }
};
// Delete all product associted to this Department
const batchProduct = (key) => {
    const prod = ProductRef.where("aisle_id", "==", key).get()
        .then(snap => {
        console.log(snap);
        snap.forEach(doc => {
            imageMag_1.RemoveImage(doc.data().photo_id);
            const product = ProductRef.doc(doc.id);
            product.delete();
        });
    }).catch(err => {
        console.error(err.stack);
    });
    return 0;
};
//# sourceMappingURL=category.js.map