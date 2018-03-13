import * as async from "async";
import { Department, IDepartment } from "../../models/department";
import { Request, Response, NextFunction } from "express";
import { RemoveImage } from './imageMag';
import  { firebase }  from "../../config/firebase-config";
import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash";
import { Error } from "mongoose";
const db = firebase.firestore();
 // Creating ref for Aisle and Category
const AisleRef = db.collection("aisles");
const category = db.collection("category");
const ProductRef = db.collection("products");

export const getApiDepartment = (req: Request, res: Response, next: NextFunction) => {
    const ref = db.collection("departments");
    // res.json({department: "data from server"});
    ref.onSnapshot(snapshot => {
        const data = [];
        snapshot.forEach((doc) => {
            const id = doc.id;
            const dt = doc.data();
            data.push({id, ...dt});
            console.log({id, ...dt});
        });
        res.json(data);
    }, (err) => res.json({error: err}));
};
export const postApiDepartment = (req: Request, res: Response, next: NextFunction) => {
    // const image_url = fs.readFileSync("./temp/imageurl.txt", "utf8");
    // const photo_id = fs.readFileSync("./temp/publicid.txt", "utf8");
    if (!req.body.name) {
        return res.json({msg: "no data posted"});
    }
    const data: Department = {
        name: req.body.name,
        code: req.body.code,
        feature_image: req.body.feature_image || null,
        group: req.body.group,
        image_url: req.body.image_url || "https://firebasestorage.googleapis.com/v0/b/urgy-a513c.appspot.com/o/fresh_Pepper.jpg?alt=media&token=64527d6c-3717-4618-babe-aee9528c795e"
    };
    const dbRef = db.collection("departments");
    dbRef.add(data).then((ref) => {
        res.json({msg: "Department was successfully added"});
    }).catch(err => {
        res.json({error: err});
    });
};
export const removeApiDepartment = (req: Request, res: Response, next: NextFunction) => {
    // Don't forget to delete the department image //
    const id = req.query.id;
    const dbRef = db.collection("departments").doc(id);
    async.waterfall([
        (done: Function) => {
            // Remove all Images associated to each product //
            const prod = ProductRef.where("department_id", "==", id).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    // Removing Product pictures from cloudinary
                    // RemoveImage(doc.data().photo_id, next);
                    // Removing the actual product
                    const product = ProductRef.doc(doc.id);
                    product.delete().then(() => {
                        console.log(`product with ${doc.id} was successfully removed`);
                    }).catch(err => {
                        res.json({error: err, msg: "Error removing Products"});
                    });
                });
                done(undefined, id);
            }).catch(err => {
                res.json({error: err, msg: "Error getting Product for removal"});
            });
        },
        (id, done: Function) => {
            const cat = category.where("department_id", "==", id).get()
            .then(snap => {
                snap.forEach(doc => {
                    const delCat = category.doc(doc.id);
                    delCat.delete().then(() => {
                        console.log(`Category with ${doc.id} , was successfully removed`);
                    }).catch(err => {
                        res.json({error: err, msg: "Error removing Category"});
                    });
                });
                done(undefined, id);
            }).catch(err => {
                res.json({error: err, msg: "Error getting Categories for removal"});
            });
        },
        (id, done: Function) => {
            const aisle = AisleRef.where("department_id", "==", id).get()
            .then(snap => {
                snap.forEach(doc => {
                    // console.log("Aisle: ", doc.id);
                    const delIsl = AisleRef.doc(doc.id);
                    delIsl.delete().then(() => {
                        console.log(`Aisle with ${doc.id} , was successfully removed`);
                    }).catch(err => {
                        res.json({error: err, msg: "Error removing Aisle"});
                    });
                });
                done(undefined, id);
            }).catch(err => {
                res.json({error: err, msg: "Error getting Aisles for removal"});
            });
        },
        (id, done: Function) => {
            dbRef.delete().then(() => {
                console.log(`Department with ${id} , was successfully removed`);
                res.status(200).json({status: "All Functions Executed Successfully", id: id});
            }).catch(err => {
                res.json({error: err, msg: "Error removing Department"});
            });
        }
    ], (err) => {
        res.json({error: err, msg: "Error Executing All Waterfall Functions"});
    });
};

