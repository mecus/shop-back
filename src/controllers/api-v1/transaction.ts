import { Request, Response, NextFunction } from "express";


export const getTransaction = (req: Request, res: Response, next: NextFunction) => {
    res.render("transaction", {title: "Transactions"});
};