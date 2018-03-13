import * as nodemailer from "nodemailer";
import * as async from "async";
import * as crypto from "crypto";
import * as bcrypt from "bcrypt-nodejs";
import { Request, Response, NextFunction } from "express";
import { firebase } from "../config/firebase-config";

export const mailAccount = {
    email: 'shop@urgy.co.uk',
    password: 'london123@'
};
export let transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: mailAccount.email, // generated ethereal user
        pass: mailAccount.password  // generated ethereal password
    },
    tls: {
        rejectUnauthorized: false
    }
});

export const sendResetPasswordEmail = (req, user, done: Function) => {
    const mailOptions = {
      to: user.email,
      from: `"Tech Support 👻" <${mailAccount.email}>`,
      subject: "Your password has been changed",
      text: user.text, // `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`,
      html: user.html
    };
    transporter.sendMail(mailOptions, (err, info) => {
      req.flash("success", { msg: "Success! Your password has been changed." });
      done(err);
    });
};
// export const sendForgotPasswordEmail = (token?, req?, user?, done?: Function) => {
//     const mailOptions = {
//     to: user.email,
//     from: `"Tech Support 👻" <${mailAccount.email}>`,
//     subject: "Reset your password on Urgy",
//     text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
//         Please click on the following link, or paste this into your browser to complete the process:\n\n
//         http://${req.headers.host}/reset/${token}\n\n
//         If you did not request this, please ignore this email and your password will remain unchanged.\n`
//     };
//     transporter.sendMail(mailOptions, (err) => {
//     req.flash("info", { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
//     done(err);
//     });
// };