"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_config_1 = require("../config/firebase-config");
const db = firebase_config_1.firebase.firestore();
const Youtube = db.collection("youtubes");
exports.getYoutube = (req, res, next) => {
    try {
        Youtube.get().then(snapshot => {
            const data = [];
            snapshot.forEach(doc => {
                data.push(Object.assign({}, doc.data(), { id: doc.id }));
            });
            res.render("youtube", { title: "Youtube video", data });
            console.log(data);
        }).catch(err => {
            next(err);
        });
    }
    catch (err) {
        next(err);
    }
};
exports.postYoutube = (req, res, next) => {
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
exports.deleteYoutube = (req, res, next) => {
    const id = req.params.id;
    try {
        const youVid = Youtube.doc(id);
        youVid.delete().then(ref => {
            res.redirect("/youtube");
        }).catch(err => {
            next(err);
        });
    }
    catch (err) {
        next(err);
    }
};
//# sourceMappingURL=youtube.js.map