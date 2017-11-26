"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_config_1 = require("../config/firebase-config");
const db = firebase_config_1.firebase.firestore();
const deptRef = db.collection("departments");
const aisleRef = db.collection("aisles");
exports.selectDepartment = (req, res) => {
    deptRef.onSnapshot(snapshot => {
        const data = snapshot.docs;
        res.render("store/select/department-select", {
            title: "Pick Department", data
        });
    });
};
exports.selectAisle = (req, res) => {
    aisleRef.onSnapshot(snapshot => {
        const data = snapshot.docs;
        res.render("store/select/aisle-select", {
            title: "Pick Aisle", data
        });
    });
};
//# sourceMappingURL=selections.js.map