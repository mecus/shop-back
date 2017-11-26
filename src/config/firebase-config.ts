const  admin  = require("firebase-admin");
const serviceAccount = require("../../firebase-adminsdk.json");



export const firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: "https://shop-5e89b.firebaseio.com",
    // databaseAuthVariableOverride: undefined
});

// const config = {
//     apiKey: "AIzaSyC3PouxaTBLmR1R2YhHKTR9dldzLGhCXwA",
//     authDomain: "shop-5e89b.firebaseapp.com",
//     databaseURL: "https://shop-5e89b.firebaseio.com",
//     projectId: "shop-5e89b",
//     storageBucket: "shop-5e89b.appspot.com",
//     messagingSenderId: "777977280371"
// };
// export const firebaseClient = firebase.initializeApp(config);