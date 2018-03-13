import * as async from "async";
import { Product, IProduct } from "../../models/product";
import { Request, Response, NextFunction } from "express";
import { Cloudinary } from '../../config/cloudinary-config';
import  { firebase }  from "../../config/firebase-config";
import { RemoveImage } from './imageMag';
import * as _ from "lodash";
const db = firebase.firestore();
const productRef = db.collection("products");
const brandtb = db.collection("brands");


export const postApiProduct = (req: Request, res: Response, next: NextFunction) => {
    const prodPrice = Number(req.body.price).toFixed(2);
    const prodOldPrice = Number(req.body.old_price).toFixed(2);
    const product = req.body;
    product.price = prodPrice;
    product.old_price = prodOldPrice;
    productRef.add(product).then(ref => {
        res.json({msg: "Product Successfully Added"});
    }, (err) => {
        res.status(500).json({msg: "Error Occur while adding product", error: err});
    });
};

// Update Product
export const updateApiProduct = (req: Request, res: Response, next: NextFunction) => {
    const id = req.query.id;
    const prodPrice = Number(req.body.price).toFixed(2);
    const prodOldPrice = Number(req.body.old_price).toFixed(2);
    const productUp = req.body;
    productUp.price = prodPrice;
    productUp.old_price = prodOldPrice;
    const oneProd = productRef.doc(id);
    oneProd.update(productUp).then(ref => {
        res.json({msg: "Product Successfully Updated", ref: ref});
    }).catch(err => {
        // console.log(err);
        res.json({msg: "Error Updating Product", error: err});
    });
};

// Delete Product
export const deleteApiProduct = (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.body);
    // const cloudId = req.body.photoId;
    const paramId = req.query.id;
    // res.json({status: "Deleted", id: paramId});
    const thisProduct = productRef.doc(paramId);
    thisProduct.delete().then(ref => {
        return res.json({msg: "Product Deleted", ref: ref});
    }).catch(err => {
        res.json({msg: "Error Deleting Product", error: err});
    });
};

export const getApiProducts = (req: Request, res: Response, next: NextFunction) => {
    try {
        productRef.get().then(snapshot => {
            const products = snapshot.docs;
            // console.log(products);
            res.status(200).json(products);
        }).catch(err => {
            console.log(err);
        });
    }
    catch (err) {
        res.status(500);
        next(err);
    }
};

// Product Brand Section
export const getApiBrands = (req: Request, res: Response, next: NextFunction) => {
    const brands = [];
    const brandcoll = brandtb.get()
    .then(snapshot => {
        snapshot.forEach(doc => {
            const brand = {...doc.data(), id: doc.id};
            brands.push(brand);
        });
        res.json(brands);
    }).catch(err => {
        res.json({msg: "Error getting brands", error: err});
    });
};
export const postApiBrand = (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) {
        return res.json({msg: "Invalid data"});
    }
    const brand = {name: req.body.name};
    brandtb.add(brand)
    .then(brand => {
        return res.json({msg: "brand addedd successfully"});
    }).catch(err => {
        res.json({msg: "Error adding brand", error: err});
    });
};
export const removeApiBrand = (req: Request, res: Response, next: NextFunction) => {
    if (!req.query.id) {
        return res.json({msg: "No brand id present"});
    }
    const uid = req.query.id;
    const brand = brandtb.doc(uid);
    brand.delete().then(writeRef => {
        res.status(200).json({msg: "Brand was Successfully removed"});
    }).catch(err => {
        console.log(err);
        res.status(200).json({msg: "Error removing brand", error: err});
    });
};
