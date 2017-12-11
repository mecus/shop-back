import { Request, Response, NextFunction } from "express";
import  { firebase }  from "../config/firebase-config";

const db = firebase.firestore();
const Products = db.collection("products");
/**
 * GET /
 * Home page.
 */
export let index = (req: Request, res: Response) => {
  // console.log(req.user);
  Products.get().then(snapshot => {
    const data = [];
    snapshot.forEach(doc => {
      data.push({...doc});
    });
    res.render("home", {data});
  }).catch(err => {
    console.log(err);
  });
};
export let dashboard = (req: Request, res: Response, next: NextFunction) => {
  Products.get().then(snapshot => {
    const data = [];
    snapshot.forEach(doc => {
      data.push({...doc});
    });
    res.render("dashboard", {data});
  }).catch(err => {
    console.log(err);
  });
};
