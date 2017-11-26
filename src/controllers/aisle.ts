import { IAisle, Aisle } from "../models/aisle";
import { Request, Response, NextFunction } from "express";
import  { firebase }  from "../config/firebase-config";
import { RemoveImage } from './imageMag';
import * as _ from "lodash";
const db = firebase.firestore();
 // Creating ref for Aisle and Category
 const category = db.collection("category");
 const ProductRef = db.collection("products");


export const getAisle = (req: Request, res: Response, next: NextFunction) => {
    const department = req.params.id;
    const ref = db.collection("aisles");
    const aisles = ref.where("department_id", "==", department);
    aisles.onSnapshot(snapshot => {
        if (snapshot) {
            const data = snapshot.docs;
            res.render("store/aisle", {title: "Aisles", data, id: req.params.id});
        }else {
            res.render("store/aisle", {title: "Aisles", id: req.params.id});
        }
    }, (err) => {
        if (err) { next(err); }
    });
};
export const getAsileJson = (req: Request, res: Response, next: NextFunction) => {
    const aisleRef = db.collection("aisles");
    aisleRef.onSnapshot(snapshot => {
        const data = snapshot.docs;
        return res.json(data);
    });
};
export const postAisle = (req: Request, res: Response, next: NextFunction) => {
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
        }else {
            res.redirect("/aisle/" + req.body.department_id);
        }
    }).catch(err => {
        res.status(500);
        next(err);
    });
};
export const removeAisle = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const docRef = db.collection("aisles").doc(id);
    await batchCategory(id);
    await batchProduct(id);
    await docRef.delete().then(ref => {
        if (ref) {
            res.json({id: ref.id});
        } else {
            res.json({id: "No returned Id"});
        }
    }).catch(err => {
        next(err);
    });
};
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
            RemoveImage(doc.data().photo_id);
            const product = ProductRef.doc(doc.id);
            product.delete();
        });
    }).catch(err => {
        console.error(err.stack);
    });
    return 0;
 };