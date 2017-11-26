import { Department, IDepartment } from "../models/department";
import { Request, Response, NextFunction } from "express";
import { RemoveImage } from './imageMag';
import  { firebase }  from "../config/firebase-config";
import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash";
import { Error } from "mongoose";
const db = firebase.firestore();
 // Creating ref for Aisle and Category
const AisleRef = db.collection("aisles");
const category = db.collection("category");
const ProductRef = db.collection("products");

export const getDepartment = (req: Request, res: Response, next: NextFunction) => {
    const ref = db.collection("departments");
    ref.onSnapshot(snapshot => {
        const data = snapshot.docs;
        res.render("store/department", {title: "Departments", data});
    }, (err) => next(err));
};
export const postDepartment = (req: Request, res: Response, next: NextFunction) => {
    // const image_url = fs.readFileSync("./temp/imageurl.txt", "utf8");
    // const photo_id = fs.readFileSync("./temp/publicid.txt", "utf8");
    if (!req.body.name) {
        // req.flash("errMsg", "Enter Values in the form");
        res.redirect("/department");
    }
    const data: Department = {
        name: req.body.name,
        code: req.body.code,
        feature_image: req.body.feature_image,
        group: req.body.group,
        image_url: req.body.image_url,
        photo_id: req.body.photo_id
    };
    const dbRef = db.collection("departments");
    // console.log(data);
    dbRef.add(data).then((ref: any) => {
        if (ref.id) {
            res.redirect("/department");
        }else {
            res.redirect("/department");
        }
        console.log(ref.id);
    }).catch(err => {
        next(err);
    });
};
export const removeDepartment = (req: Request, res: Response, next: NextFunction) => {
    // Don't forget to delete the department image //
    const id = req.params.id;
    const dbRef = db.collection("departments").doc(id);
    try {
        const executDelete = async () => {
            await batchAisle(id);
            await batchCategory(id);
            await batchProduct(id);
            await dbRef.delete();
            return res.json({id: id});
        };
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
            RemoveImage(doc.data().photo_id);

            // Removing the actual product
            const product = ProductRef.doc(doc.id);
            product.delete();
        });
    }).catch(err => {
        console.error(err.stack);
    });
    return 0;
 };

export const uploadImage = (req: Request, res: Response) => {
    const url = req.body.image_url;
    const id = req.body.public_id;
    fs.writeFileSync("./temp/imageurl.txt", url, {encoding: "utf8"});
    fs.writeFileSync("./temp/publicid.txt", id, {encoding: "utf8"});
    res.json({res: "Image Uploaded"});
};

