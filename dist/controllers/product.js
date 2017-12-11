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
const productRef = db.collection("products");
const catRef = db.collection("category");
const brands = ["Juno Foods", "Beautiful Foods", "Ades Foods"];
exports.getProducts = (req, res, next) => {
    try {
        productRef.onSnapshot(snapshot => {
            const products = snapshot.docs;
            if (snapshot) {
                res.status(200).render("store/products/products", { products, title: "Products" });
            }
            else {
                res.render("store/products/products", { title: "Products" });
            }
        });
    }
    catch (err) {
        res.status(500);
        next(err);
    }
};
exports.newProduct = (req, res, next) => {
    const id = req.params.id;
    if (id) {
        try {
            const catColl = catRef.doc(id).get();
            catColl.then(snapshot => {
                const data = snapshot.data();
                if (data) {
                    res.render("store/products/new", { cat_id: id, data, brands, title: "New Product" });
                }
                else {
                    res.render("store/products/new", { cat_id: id, brands, title: "New Product" });
                }
            }).catch(err => {
                next(err);
            });
        }
        catch (err) {
            res.status(500);
            next(err);
        }
    }
    else {
        res.render("store/products/new", { title: "New Product" });
    }
};
exports.showProduct = (req, res, next) => {
    const paramId = req.params.id;
    const oneProd = productRef.doc(paramId);
    oneProd.get().then(doc => {
        const data = doc.data();
        const id = doc.id;
        if (!doc.exists) {
            return;
        }
        else {
            res.render("store/products/show", { data, id, title: "Product" });
            // console.log(data);
        }
    }).catch((err) => {
        if (err) {
            next(err);
        }
    });
};
exports.postProduct = (req, res, next) => {
    const prodPrice = Number(req.body.price).toFixed(2);
    const prodOldPrice = Number(req.body.old_price).toFixed(2);
    const product = {
        name: req.body.name,
        code: req.body.code,
        price: prodPrice,
        old_price: prodOldPrice,
        imageUrl: "product.jpg",
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
exports.editProduct = (req, res) => {
    console.log(req.body);
    const id = req.params.id;
    const oneProd = productRef.doc(id);
    oneProd.get().then(snapshot => {
        const data = snapshot.data();
        // console.log(data);
        res.render("store/products/edit", { id, data, brands });
    }).catch(err => {
        console.log(err);
    });
};
// Update Product
exports.updateProduct = (req, res, next) => {
    const id = req.body.id;
    if (!req.body) {
        return next();
    }
    if (req.body.public_id) {
        // const id = req.body.id;
        const oneProd = productRef.doc(id);
        const photoId = req.body.public_id;
        const photolink = req.body.image_url;
        try {
            oneProd.update({ photo_id: photoId, imageUrl: photolink });
        }
        catch (err) {
            console.error(err);
            next(err);
        }
        return res.json({ id: id });
    }
    else {
        const prodPrice = Number(req.body.price).toFixed(2);
        const prodOldPrice = Number(req.body.old_price).toFixed(2);
        const productUp = {
            name: req.body.name,
            code: req.body.code,
            price: prodPrice,
            old_price: prodOldPrice,
            stock: req.body.stock,
            brand: req.body.brand || "",
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
        const oneProd = productRef.doc(id);
        oneProd.update(productUp).then(ref => {
            res.redirect("/products/show/" + req.body.id);
        }).catch(err => {
            // console.log(err);
            next(err);
        });
    }
};
// Delete Product
exports.deleteProduct = (req, res) => {
    // console.log(req.body);
    const cloudId = req.body.photoId;
    const paramId = req.body.id;
    // res.json({status: "Deleted", id: paramId});
    const thisProduct = productRef.doc(paramId);
    const removeProduct = () => __awaiter(this, void 0, void 0, function* () {
        yield thisProduct.delete().then(ref => {
            return ref;
        }).catch(err => {
            console.log(err);
        });
        yield imageMag_1.RemoveImage(cloudId);
        res.status(201);
        return res.json({ status: "Deleted", id: paramId });
    });
    removeProduct();
};
exports.getApiProducts = (req, res, next) => {
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
//# sourceMappingURL=product.js.map