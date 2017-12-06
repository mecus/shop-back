import { Request, Response, NextFunction } from "express";
import  { firebase }  from "../config/firebase-config";
const db = firebase.firestore();
const Youtube = db.collection("youtubes");

export const getYoutube = (req: Request, res: Response, next: NextFunction) => {
    try {
        Youtube.get().then(snapshot => {
            const data = [];
            snapshot.forEach(doc => {
                data.push({...doc.data(), id: doc.id});
            });
            res.render("youtube", {title: "Youtube video", data});
           console.log(data);
        }).catch(err => {
            next(err);
        });
    } catch (err) {
        next(err);
    };
};
export const postYoutube = (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.name || !req.body.youtube_link) {
        return res.redirect("/youtube");
    }
    const youTube = {
        name: req.body.name,
        tag: req.body.tag,
        youtube_link: req.body.youtube_link,
    };
    Youtube.add(youTube).then(ref => {
        res.redirect("/youtube");
    }).catch(err => {
        next(err);
    });
};
export const deleteYoutube = (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    try {
        const youVid = Youtube.doc(id);
        youVid.delete().then(ref => {
            res.redirect("/youtube");
        }).catch(err => {
            next(err);
        })
    } catch (err) {
        next(err);
    };
};