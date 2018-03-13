import { Response, Request, NextFunction } from 'express';
import { Advert } from '../../models/advert.model';
import { firebase }  from "../../config/firebase-config";
import { RemoveImage } from './imageMag';
import * as _ from "lodash";
const db = firebase.firestore();
const advert = db.collection('adverts');

export const getAdverts = (req: Request, res: Response, next: NextFunction) => {
    const adverts: Advert = advert.get()
    .then(snapshot => {
        const data = [];
        snapshot.forEach(doc => {
            data.push({...doc.data(), id: doc.id});
        });
        res.render("store/advert", {title: "Advert", data});
    })
    .catch(err => {
        next(err);
    });
    // res.render("store/advert", {title: "Advert"});
};

export const postAdvert = async (req: Request, res: Response, next: NextFunction) => {
    // const body = req.body;
    // console.log(body);
    if (!req.body.name && !req.body.url) {
        return res.redirect("/adverts");
    }
    const adverts: Advert = {
        name: req.body.name,
        tag: req.body.tag,
        group: req.body.group,
        url: req.body.url,
        photo_id: req.body.photo_id
    };
    // console.log(adverts);
    await advert.add(adverts)
    .then(res => {
        console.log(res.id);
    })
    .catch(err => {
        // console.log(err);
        next(err);
    });
    res.redirect("/adverts");
};
// Edit Advert
export const editAdvert = (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const ad = advert.doc(id).get();
    ad.then(snapshot => {
        const data = snapshot.data();
        console.log(data);
        res.render("store/edit-advert", {data, id});
    }).catch(err => {
        // console.log(err);
        next(err);
    });
};
export const updateAdvert = (req: Request, res: Response, next: NextFunction) => {
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
export const deleteAdvert = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    console.log(id);
    const adv = advert.doc(id);
    await adv.get().then(snapshot => {
        const data = snapshot.data();
        RemoveImage(data.photo_id, next);
        console.log("Found Advert");
    }).catch(err => {
        // console.log(err);
        next(err);
    });
    await adv.delete().then(ref => {
        console.log("Ad deleted", ref);
        res.redirect('/adverts');
    }).catch(err => {
        // console.log(err);
        next(err);
    });
};