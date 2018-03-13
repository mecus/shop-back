import * as async from "async";
import { ICategory, Category } from "../../models/category";
import { Request, Response, NextFunction } from "express";
import  { firebase }  from "../../config/firebase-config";
import { RemoveImage } from './imageMag';
import * as _ from "lodash";
const db = firebase.firestore();
 // Creating ref for Aisle and Category
 const ProductRef = db.collection("products");

export const getCategory = (req: Request, res: Response, next: NextFunction) => {
    const params = req.query;
    const dbRef = db.collection("category");
    const cat = dbRef.where("aisle_id", "==", params.aisle_id);
    cat.get().then(snapshot => {
        const data: Category[] = snapshot.docs;
        res.render("store/category", {params, data, title: "Categories"});
    }).catch(err => {
        next(err);
    });
};
export const postApiCategory = (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.name) {
        return res.json({msg: "invalid data"});
    }
    const data: Category = {
        name: req.body.name,
        group: req.body.group,
        aisle_id: req.body.aisle_id,
        department_id: req.body.department_id
    };
    const dbRef = db.collection("category");
    dbRef.add(data).then(ref => {
        res.json({msg: "Category was successfully added"});
    }).catch(err => {
        res.json({msg: "Error adding Category", error: err});
    });
};
export const removeApiCategory = (req: Request, res: Response, next: NextFunction) => {
    if (!req.query.id) {
        return;
    }
    const key = req.query.id;
    const dbRef = db.collection("category").doc(key);
    // console.log("ID:", key);
    // res.json({id: paramsId});
    async.waterfall([
        (done: Function) => {
            const prod = ProductRef.where("aisle_id", "==", key);
            prod.get()
            .then(snap => {
                snap.forEach(doc => {
                    const product = ProductRef.doc(doc.id);
                    product.delete().then(() => {
                        console.log(`Product with ${doc.id} was successfully remove`);
                    }).catch(err => {
                        res.json({msg: "Error Deleting Products", error: err});
                    });
                });
                done(undefined, key);
            }).catch(err => {
                next(err);
            });
         },
         (key, done: Function) => {
            dbRef.delete().then(ref => {
                res.json({id: key});
            }).catch(err => {
                res.json({msg: "Error Deleting Products", error: err});
            });
         }
    ], (err) => {
        res.json({msg: "Error Executing Functions", error: err});
    });
};
