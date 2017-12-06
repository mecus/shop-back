"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_config_1 = require("../config/firebase-config");
const db = firebase_config_1.firebase.firestore();
const deptRef = db.collection("departments");
const aisleRef = db.collection("aisles");
const categoryRef = db.collection("category");
exports.selectDepartment = (req, res) => {
    deptRef.onSnapshot(snapshot => {
        const data = snapshot.docs;
        res.render("store/select/department-select", {
            title: "Pick Department", data
        });
    });
};
exports.selectAisle = (req, res) => {
    const id = req.params.id;
    aisleRef.where("department_id", "==", id).onSnapshot(snapshot => {
        const data = snapshot.docs;
        res.render("store/select/aisle-select", {
            title: "Pick Aisle", data
        });
    });
};
exports.selectCategory = (req, res) => {
    const id = req.params.id;
    categoryRef.where("aisle_id", "==", id).onSnapshot(snapshot => {
        const data = snapshot.docs;
        res.render("store/select/category-select", {
            title: "Pick Category", data
        });
    });
};
//# sourceMappingURL=selections.js.map