"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_config_1 = require("../config/firebase-config");
const imageMag_1 = require("./imageMag");
const db = firebase_config_1.firebase.firestore();
// Creating ref for Aisle and Category
const category = db.collection("category");
const ProductRef = db.collection("products");
exports.getAisle = (req, res, next) => {
    const department = req.params.id;
    const ref = db.collection("aisles");
    const aisles = ref.where("department_id", "==", department);
    aisles.onSnapshot(snapshot => {
        if (snapshot) {
            const data = snapshot.docs;
            res.render("store/aisle", { title: "Aisles", data, id: req.params.id });
        }
        else {
            res.render("store/aisle", { title: "Aisles", id: req.params.id });
        }
    }, (err) => {
        if (err) {
            next(err);
        }
    });
};
exports.getAsileJson = (req, res, next) => {
    const aisleRef = db.collection("aisles");
    aisleRef.onSnapshot(snapshot => {
        const data = snapshot.docs;
        return res.json(data);
    });
};
exports.postAisle = (req, res, next) => {
    // console.log(req.body);
    const data = {
        department_id: req.body.department_id,
        name: req.body.name,
        group: req.body.group
    };
    const dbRef = db.collection("aisles");
    dbRef.add(data).then(ref => {
        if (ref) {
            console.log(ref.id);
            res.redirect("/aisle/" + req.body.department_id);
        }
        else {
            res.redirect("/aisle/" + req.body.department_id);
        }
    }).catch(err => {
        res.status(500);
        next(err);
    });
};
exports.removeAisle = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const id = req.params.id;
    const docRef = db.collection("aisles").doc(id);
    yield batchCategory(id);
    yield batchProduct(id);
    yield docRef.delete().then(ref => {
        if (ref) {
            res.json({ id: ref.id });
        }
        else {
            res.json({ id: "No returned Id" });
        }
    }).catch(err => {
        next(err);
    });
});
const batchCategory = (key) => {
    const cat = category.where("aisle_id", "==", key).get()
        .then(snap => {
        snap.forEach(doc => {
            console.log("Cats: ", doc.id, doc.data().name);
            const categ = category.doc(doc.id);
            categ.delete();
        });
    }).catch(err => {
        console.error(err.stack);
    });
    return 0;
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
//# sourceMappingURL=aisle.js.map