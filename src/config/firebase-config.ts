const  admin  = require("firebase-admin");
const serviceAccount = require("../../firebase-adminsdk.json");

export const firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://urgy-a513c.firebaseio.com"
    // databaseAuthVariableOverride: undefined
});

export const authenticate = (req, res, next) => {
    if (!req.session || !req.session.uid) {
        return res.redirect("/login");
    }
    next();
};
export const isAuthorized = (req, res, next) => {
    if (!req.session.admin) {
        res.render("access", {title: "Access Deniel", content: "You are not authorized here!"});
    }
    next();
};
export const setLocalSession = (req, res, next) => {
    if (req.session.uid) {
        res.locals.uid = req.session.uid;
        res.locals.user = req.session.user;
        res.locals.email = req.session.email;
        res.locals.admin = req.session.admin;
        res.locals.editor = req.session.editor;
        res.locals.general = req.session.general;
        next();
    } else {
        next();
    }
};
export const setUserSession = (req, userRecord) => {
    if (userRecord.customClaims
        && userRecord.customClaims.admin == true
        && userRecord.customClaims.editor == true
        && userRecord.customClaims.general == true) {
        req.session.admin = userRecord.customClaims.admin;
        req.session.editor = userRecord.customClaims.editor;
        req.session.general = userRecord.customClaims.general;
        req.session.uid = userRecord.uid;
        req.session.user = userRecord.displayName;
        req.session.email = userRecord.email;
      } else
      if (userRecord.customClaims
        && userRecord.customClaims.editor == true
        && userRecord.customClaims.general == true) {
        // console.log(userRecord.customClaims.admin);
        // console.log(userRecord.customClaims);
        // req.session.admin = userRecord.customClaims.admin;
        req.session.editor = userRecord.customClaims.editor;
        req.session.general = userRecord.customClaims.general;
        req.session.uid = userRecord.uid;
        req.session.user = userRecord.displayName;
        req.session.email = userRecord.email;
        // res.status(200).json({status: "Authenticated"});
      }
      else if (userRecord.customClaims && userRecord.customClaims.general == true) {
        // console.log("Checking for General");
        req.session.general = true;
        req.session.editor = false;
        req.session.uid = userRecord.uid;
        req.session.user = userRecord.displayName;
        req.session.email = userRecord.email;
        req.session.admin = false;
        // res.status(200).json({status: "Authenticated"});
      }
      else {
        // const user = {uid: userRecord.uid, email: userRecord.email};
        req.session.general = false;
        req.session.editor = false;
        req.session.uid = userRecord.uid;
        req.session.user = userRecord.displayName;
        req.session.email = userRecord.email;
        req.session.admin = false;
        // res.status(200).json({status: "Authenticated"});
      }
};
// const config = {
//     apiKey: "AIzaSyC3PouxaTBLmR1R2YhHKTR9dldzLGhCXwA",
//     authDomain: "shop-5e89b.firebaseapp.com",
//     databaseURL: "https://shop-5e89b.firebaseio.com",
//     projectId: "shop-5e89b",
//     storageBucket: "shop-5e89b.appspot.com",
//     messagingSenderId: "777977280371"
// };
// export const firebaseClient = firebase.initializeApp(config);