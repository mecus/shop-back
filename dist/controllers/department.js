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
const imageMag_1 = require("./imageMag");
const firebase_config_1 = require("../config/firebase-config");
const fs = require("fs");
const db = firebase_config_1.firebase.firestore();
// Creating ref for Aisle and Category
const AisleRef = db.collection("aisles");
const category = db.collection("category");
const ProductRef = db.collection("products");
exports.getDepartment = (req, res, next) => {
    const ref = db.collection("departments");
    ref.onSnapshot(snapshot => {
        const data = snapshot.docs;
        res.render("store/department", { title: "Departments", data });
    }, (err) => next(err));
};
exports.postDepartment = (req, res, next) => {
    // const image_url = fs.readFileSync("./temp/imageurl.txt", "utf8");
    // const photo_id = fs.readFileSync("./temp/publicid.txt", "utf8");
    if (!req.body.name) {
        // req.flash("errMsg", "Enter Values in the form");
        res.redirect("/department");
    }
    const data = {
        name: req.body.name,
        code: req.body.code,
        feature_image: req.body.feature_image,
        group: req.body.group,
        image_url: req.body.image_url,
        photo_id: req.body.photo_id
    };
    const dbRef = db.collection("departments");
    // console.log(data);
    dbRef.add(data).then((ref) => {
        if (ref.id) {
            res.redirect("/department");
        }
        else {
            res.redirect("/department");
        }
        console.log(ref.id);
    }).catch(err => {
        next(err);
    });
};
exports.removeDepartment = (req, res, next) => {
    // Don't forget to delete the department image //
    const id = req.params.id;
    const dbRef = db.collection("departments").doc(id);
    try {
        const executDelete = () => __awaiter(this, void 0, void 0, function* () {
            yield batchAisle(id);
            yield batchCategory(id);
            yield batchProduct(id);
            yield dbRef.delete();
            return res.json({ id: id });
        });
        return executDelete();
    }
    catch (err) {
        next(err);
    }
};
const batchAisle = (key) => {
    const aisle = AisleRef.where("department_id", "==", key).get()
        .then(snap => {
        snap.forEach(doc => {
            // console.log("Aisle: ", doc.id);
            const delIsl = AisleRef.doc(doc.id);
            delIsl.delete();
        });
    }).catch(err => {
        console.error("Error", err.stack);
    });
    return 0;
};
const batchCategory = (key) => {
    const cat = category.where("department_id", "==", key).get()
        .then(snap => {
        snap.forEach(doc => {
            console.log("Cats: ", doc.id);
            const delCat = category.doc(doc.id);
            delCat.delete();
        });
    }).catch(err => {
        console.error("Error", err.stack);
    });
    return 0;
};
// Delete all product associted to this Department
const batchProduct = (key) => {
    // Remove all Images associated to each product //
    const prod = ProductRef.where("department_id", "==", key).get()
        .then(snapshot => {
        snapshot.forEach(doc => {
            console.log(doc.id);
            // Removing Product pictures from cloudinary
            imageMag_1.RemoveImage(doc.data().photo_id);
            // Removing the actual product
            const product = ProductRef.doc(doc.id);
            product.delete();
        });
    }).catch(err => {
        console.error(err.stack);
    });
    return 0;
};
exports.uploadImage = (req, res) => {
    const url = req.body.image_url;
    const id = req.body.public_id;
    fs.writeFileSync("./temp/imageurl.txt", url, { encoding: "utf8" });
    fs.writeFileSync("./temp/publicid.txt", id, { encoding: "utf8" });
    res.json({ res: "Image Uploaded" });
};
//# sourceMappingURL=department.js.map