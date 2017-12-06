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
const advert = db.collection('adverts');
exports.getAdverts = (req, res, next) => {
    const adverts = advert.get()
        .then(snapshot => {
        const data = [];
        snapshot.forEach(doc => {
            data.push(Object.assign({}, doc.data(), { id: doc.id }));
        });
        res.render("store/advert", { title: "Advert", data });
    })
        .catch(err => {
        next(err);
    });
    // res.render("store/advert", {title: "Advert"});
};
exports.postAdvert = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    // const body = req.body;
    // console.log(body);
    if (!req.body.name && !req.body.url) {
        return res.redirect("/adverts");
    }
    const adverts = {
        name: req.body.name,
        tag: req.body.tag,
        group: req.body.group,
        url: req.body.url,
        photo_id: req.body.photo_id
    };
    // console.log(adverts);
    yield advert.add(adverts)
        .then(res => {
        console.log(res.id);
    })
        .catch(err => {
        // console.log(err);
        next(err);
    });
    res.redirect("/adverts");
});
// Edit Advert
exports.editAdvert = (req, res, next) => {
    const id = req.params.id;
    const ad = advert.doc(id).get();
    ad.then(snapshot => {
        const data = snapshot.data();
        console.log(data);
        res.render("store/edit-advert", { data, id });
    }).catch(err => {
        // console.log(err);
        next(err);
    });
};
exports.updateAdvert = (req, res, next) => {
    const id = req.body.id;
    const update = {
        name: req.body.name,
        tag: req.body.tag,
        group: req.body.group
    };
    const ad = advert.doc(id);
    ad.update(update).then(ref => {
        res.redirect("/adverts");
    }).catch(err => {
        // console.log(err);
        next(err);
    });
    // console.log(req.body);
};
// Delete Advert
exports.deleteAdvert = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const id = req.params.id;
    console.log(id);
    const adv = advert.doc(id);
    yield adv.get().then(snapshot => {
        const data = snapshot.data();
        imageMag_1.RemoveImage(data.photo_id);
        console.log("Found Advert");
    }).catch(err => {
        // console.log(err);
        next(err);
    });
    yield adv.delete().then(ref => {
        console.log("Ad deleted", ref);
        res.redirect('/adverts');
    }).catch(err => {
        // console.log(err);
        next(err);
    });
});
//# sourceMappingURL=adverts.js.map