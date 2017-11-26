import { Product, IProduct } from "../models/product";
import { Request, Response, NextFunction } from "express";
import { Cloudinary } from '../config/cloudinary-config';
import  { firebase }  from "../config/firebase-config";
import { RemoveImage } from './imageMag';
import * as _ from "lodash";
const db = firebase.firestore();
const productRef = db.collection("products");
const catRef = db.collection("category");
const brands = ["Juno Foods", "Beautiful Foods", "Ades Foods"];

export const getProducts = (req: Request, res: Response, next: NextFunction) => {
    try {
        productRef.onSnapshot(snapshot => {
            const products = snapshot.docs;

            if (snapshot) {
                res.render("store/products/products", {products, title: "Products"});
            }else {
                res.render("store/products/products", {title: "Products"});
            }
        });
    }
    catch (err) {
        res.status(500);
        next(err);
    }
};
export const newProduct = (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    if (query) {
        try {
            const catColl = catRef.where("aisle_id", "==", query.aisle_id);
            catColl.onSnapshot(snapshot => {
                const data = snapshot.docs;
                if (data) {
                    res.render("store/products/new", {query, data, brands, title: "New Product"});
                }else {
                    res.render("store/products/new", {query, brands, title: "New Product"});
                }
            });
        }
        catch (err) {
            res.status(500);
            next(err);
        }
    }else {
        res.render("store/products/new", {title: "New Product"});
    }
};
export const showProduct = (req: Request, res: Response, next: NextFunction) => {
    const paramId = req.params.id;
    const oneProd = productRef.doc(paramId);
    oneProd.get().then(doc => {
        const data = doc.data();
        const id = doc.id;
        if (!doc.exists) {
            return;
        }else {
            res.render("store/products/show", {data, id, title: "Product"});
            // console.log(data);
        }
    }).catch((err) => {
        if (err) {
            next(err);
        }
    });
};
export const postProduct = (req: Request, res: Response, next: NextFunction) => {
    const prodPrice = Number(req.body.price).toFixed(2);
    const prodOldPrice = Number(req.body.old_price).toFixed(2);
    const product: Product = {
        name: req.body.name,
        code: req.body.code,
        price: prodPrice,
        old_price: prodOldPrice,
        imageUrl: req.body.imageUrl,
        category: req.body.category,
        department_id: req.body.department_id,
        category_id: req.body.category_id,
        aisle_id: req.body.aisle_id,
        photo_id: req.body.photo_id || "1234567890",
        stock: req.body.stock,
        brand: req.body.brand,
        offer: req.body.offer || "no",
        sponsored: req.body.sponsored || "no",
        recommend: req.body.recommend || "no",
        description: {
            detail: req.body.detail,
            size: req.body.size,
            origin: req.body.origin
        },
        nutrition: {
            energy: req.body.energy,
            fat: req.body.fat,
            saturates: req.body.saturates,
            salt: req.body.salt
        },
        publish: req.body.publish || "off"
    };
    // console.log(product);
    productRef.add(product).then(ref => {
        res.redirect(301, "/products");
    }, (err) => {
        res.status(500);
        next(err);
    });
};

// Edit Page Request
export const editProduct = (req: Request, res: Response) => {
    console.log(req.body);
};

// Update Product
export const updateProduct = (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) { return next(); }
    if (req.body.public_id) {
        const id = req.body.id;
        const oneProd = productRef.doc(id);
        const photoId = req.body.public_id;
        const photolink = req.body.image_url;
        try {
            oneProd.update({photo_id: photoId, imageUrl: photolink});
        }
        catch (err) {
            console.error(err);
            next(err);
        }
        return res.json({id: id});
    } else {
        console.log(req.body);
        return res.json({ id: "id" });
    }
};

// Delete Product
export const deleteProduct = (req: Request, res: Response) => {
    // console.log(req.body);
    const cloudId = req.body.photoId;
    const paramId = req.body.id;
    // res.json({status: "Deleted", id: paramId});
    const thisProduct = productRef.doc(paramId);
    const removeProduct = async () => {
        await thisProduct.delete();
        await RemoveImage(cloudId);
        res.status(201);
        return res.json({status: "Deleted", id: paramId});
    };
    removeProduct();
};