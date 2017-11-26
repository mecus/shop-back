import { Department, IDepartment } from "../models/department";
import { IAisle, Aisle } from "../models/aisle";
import { Request, Response, NextFunction } from "express";
import  { firebase }  from "../config/firebase-config";
import * as _ from "lodash";
const db = firebase.firestore();
const deptRef = db.collection("departments");
const aisleRef = db.collection("aisles");

export const selectDepartment = (req: Request, res: Response) => {
    deptRef.onSnapshot(snapshot => {
        const data = snapshot.docs;
        res.render("store/select/department-select", {
            title: "Pick Department", data
        });
    });
};
export const selectAisle = (req: Request, res: Response) => {
    aisleRef.onSnapshot(snapshot => {
        const data = snapshot.docs;
        res.render("store/select/aisle-select", {
            title: "Pick Aisle", data
        });
    });
};