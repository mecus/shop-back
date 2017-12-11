import { ICategory, Category } from "../models/category";
import { Request, Response, NextFunction } from "express";
import  { firebase }  from "../config/firebase-config";
import { RemoveImage } from './imageMag';
import * as _ from "lodash";
const db = firebase.firestore();
 // Creating ref for Aisle and Category
 const ProductRef = db.collection("products");

export const getCategory = (req: Request, res: Response, next: NextFunction) => {
    const params = req.query;
    const dbRef = db.collection("category");
    const cat = dbRef.where("aisle_id", "==", params.aisle_id);
    cat.onSnapshot(snapshot => {
        const data: Category[] = snapshot.docs;
        if (data) {
            res.render("store/category", {params, data, title: "Categories"});
        }else {
            dbRef.onSnapshot(snapshot => {
                const data = snapshot.docs;
                if (data) {
                    res.render("store/category", {params, data, title: "Categories"});
                }
            });
        }
    });
};
export const postCategory = (req: Request, res: Response, next: NextFunction) => {
    const data: Category = {
        name: req.body.name,
        group: req.body.group,
        aisle_id: req.body.aisle_id,
        department_id: req.body.department_id
    };
    const dbRef = db.collection("category");
    dbRef.add(data).then(ref => {
        if (ref) {
            res.redirect(`/category/?aisle_id=${req.body.aisle_id}&department_id=${req.body.department_id}`);
        }else {
            res.redirect("/department");
        }
    }).catch(err => {
        next(err);
    });
};
export const removeCategory = (req: Request, res: Response, next: NextFunction) => {
    const paramsId = req.params.id;
    const dbRef = db.collection("category").doc(paramsId);
    // res.json({id: paramsId});
    if (paramsId) {
        batchProduct(paramsId);
        dbRef.delete().then(ref => {
            res.json({id: paramsId});
        }).catch(err => {
            res.status(500);
            next(err);
        });
    } else {
        res.redirect("/department");
    }
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