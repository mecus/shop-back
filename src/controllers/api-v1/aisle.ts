import * as async from "async";
import { IAisle, Aisle } from "../../models/aisle";
import { Request, Response, NextFunction } from "express";
import  { firebase }  from "../../config/firebase-config";
import { RemoveImage } from './imageMag';
import * as _ from "lodash";
const db = firebase.firestore();
 // Creating ref for Aisle and Category
 const category = db.collection("category");
 const ProductRef = db.collection("products");


export const getApiAisle = (req: Request, res: Response, next: NextFunction) => {
    const department = req.params.id;
    const ref = db.collection("aisles");
    const aisles = ref.where("department_id", "==", department);
    aisles.get().then(snapshot => {
        const data = snapshot.docs;
        res.render("store/aisle", {title: "Aisles", data, id: req.params.id});
    }).catch(err => {
        next(err);
    });
};
export const getApiAsileJson = (req: Request, res: Response, next: NextFunction) => {
    const aisleRef = db.collection("aisles");
    aisleRef.onSnapshot(snapshot => {
        const data = snapshot.docs;
        return res.json(data);
    });
};
export const postApiAisle = (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.body);
    if (!req.body.name) {
        return res.json({msg: "invalid data submitted"});
    }
    const data = {
        department_id: req.body.department_id,
        name: req.body.name,
        group: req.body.group
    };
    const dbRef = db.collection("aisles");
    dbRef.add(data).then(ref => {
        res.json({msg: "Aisle was successfully added", ref: ref});
    }).catch(err => {
        res.json({msg: "Aisle was not successfully added", error: err});
    });
};
export const removeApiAisle = (req: Request, res: Response, next: NextFunction) => {
    if (!req.query.id) {
        return null;
    }
    const id = req.query.id;
    // first function the waterfall == Removal of products
    // second function in the waterfall == Removal of Categories
    // third function in the waterfall == Removal of Aisle
    async.waterfall([
         (done: Function) => {
            const prod = ProductRef.where("aisle_id", "==", id).get()
            .then(snap => {
                snap.forEach(doc => {
                    console.log("Product: ", doc.id, doc.data().name);
                    const product = ProductRef.doc(doc.id);
                    product.delete();
                });
                done(undefined, id);
            }).catch(err => {
                res.json({msg: "error removing products", error: err});
            });
         },
         (id, done: Function) => {
            const cat = category.where("aisle_id", "==", id).get()
            .then(snap => {
                snap.forEach(doc => {
                    console.log("Cats: ", doc.id, doc.data().name);
                    const categ = category.doc(doc.id);
                    categ.delete();
                });
                done(undefined, id);
            }).catch(err => {
                res.json({msg: "error removing category", error: err});
            });
        },
        (id, done: Function) => {
            const docRef = db.collection("aisles").doc(id);
            docRef.delete().then(ref => {
                res.json({msg: "Aisle deleted successfully", ref: ref.id});
            }).catch(err => {
                res.json({msg: "error removing aisle", error: err});
            });
        }

    ], (err) => {
        res.json({msg: "error executing functions", error: err});
    });
};