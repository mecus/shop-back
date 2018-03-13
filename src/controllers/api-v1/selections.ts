import { Department, IDepartment } from "../../models/department";
import { IAisle, Aisle } from "../../models/aisle";
import { Request, Response, NextFunction } from "express";
import  { firebase }  from "../../config/firebase-config";
import * as _ from "lodash";
const db = firebase.firestore();
const deptRef = db.collection("departments");
const aisleRef = db.collection("aisles");
const categoryRef = db.collection("category");

export const selectDepartment = (req: Request, res: Response) => {
    deptRef.onSnapshot(snapshot => {
        const data = snapshot.docs;
        res.render("store/select/department-select", {
            title: "Pick Department", data
        });
    });
};
export const selectAisle = (req: Request, res: Response) => {
    const id = req.params.id;
    aisleRef.where("department_id", "==", id).onSnapshot(snapshot => {
        const data = snapshot.docs;
        res.render("store/select/aisle-select", {
            title: "Pick Aisle", data
        });
    });
};

export const selectCategory = (req: Request, res: Response) => {
    const id = req.params.id;
    categoryRef.where("aisle_id", "==", id).onSnapshot(snapshot => {
        const data = snapshot.docs;
        res.render("store/select/category-select", {
            title: "Pick Category", data
        });
    });
};