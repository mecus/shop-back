import * as async from "async";
import * as crypto from "crypto";
import * as bcrypt from "bcrypt-nodejs";
import * as nodemailer from "nodemailer";
import * as passport from "passport";
import { default as User, UserModel, AuthToken } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { LocalStrategyInfo } from "passport-local";
import { WriteError } from "mongodb";
const request = require("express-validator");
import { firebase } from "../config/firebase-config";

export let getLogin = (req: Request, res: Response) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("account/login", {
    title: "Login"
  });
};

export let postLogin = (req: Request, res: Response, next: NextFunction) => {
  const email = req.body.email;
  const uid = req.body.uid;
  firebase.auth().getUserByEmail(email)
  .then((userRecord) => {
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
      res.status(200).json({status: "Authenticated"});
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
      res.status(200).json({status: "Authenticated"});
    }
    else if (userRecord.customClaims && userRecord.customClaims.general == true) {
      // console.log("Checking for General");
      req.session.general = true;
      req.session.editor = false;
      req.session.uid = userRecord.uid;
      req.session.user = userRecord.displayName;
      req.session.email = userRecord.email;
      req.session.admin = false;
      res.status(200).json({status: "Authenticated"});
    }
    else {
      // const user = {uid: userRecord.uid, email: userRecord.email};
      req.session.general = false;
      req.session.editor = false;
      req.session.uid = userRecord.uid;
      req.session.user = userRecord.displayName;
      req.session.email = userRecord.email;
      req.session.admin = false;
      res.status(200).json({status: "Authenticated"});
    }
    // console.log("Successfully fetched user data:", userRecord.toJSON());
  })
  .catch((error) => {
    console.log("Error fetching user data:", error);
  });
};

export let logout = (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy((err) => {
    if (err) { next(err); }
    console.log("Deleting Session");
    res.status(200).json({status: "Successfully destroy Session"});
  });
};

export let getSignup = (req: Request, res: Response) => {
  if (req.user) {
    return res.redirect("/dashboard");
  }
  res.render("account/signup", {
    title: "Create Account"
  });
};

export let postSignup = (req: Request, res: Response, next: NextFunction) => {
  req.assert("email", "Email is not valid").isEmail();
  req.assert("display_name", "Name most not be empty").notEmpty();
  req.assert("password", "Password must be at least 4 characters long").len({ min: 4 });
  req.assert("confirmPassword", "Passwords do not match").equals(req.body.password);
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash("errors", errors);
    return res.redirect("/signup");
  }
  firebase.auth().createUser({
    email: req.body.email,
    emailVerified: false,
    phoneNumber: req.body.telephone, // "+11234597760",
    password: req.body.password,
    displayName: req.body.display_name,
    photoURL: "http://www.example.com/12345678/photo.png",
    disabled: false
  })
    .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
     setCustomUserClaim(userRecord.uid, {admin: false, editor: false, general: true});
      res.redirect("/login");
    })
    .catch((error) => {
      console.log("Error creating new user:", error);
    });
};
export let getAuthenticatedUsers = (req: Request, res: Response, next: NextFunction) => {
  firebase.auth().listUsers()
  .then(listUsers => {
    const users = listUsers.users;
    // console.log(listUsers.users);
    res.render("account/authusers", {users, title: "Authenticated Users"});
  }).catch(err => {
    next(err);
  });
};
export let getUpdateAuthenticatedUser = (req: Request, res: Response, next: NextFunction) => {
  const uid = req.params.id;
  firebase.auth().getUser(uid).then((user) => {
    // console.log(user);
    res.render("account/update", {user, title: "Update User"});
  }).catch((err) => {
    next(err);
  });
};
export let postUpdateAuthenticatedUser = (req: Request, res: Response, next: NextFunction) => {
  const uid = req.body.uid;
  const status = {
    admin: Boolean(req.body.adminStatus),
    editor: Boolean(req.body.editor),
    general: Boolean(req.body.gen)
  };
  const user =  {
    email: req.body.email,
    phoneNumber: req.body.telephone,
    emailVerified: Boolean(req.body.emailVerified),
    // password: req.body.password,
    displayName: req.body.display_name,
    photoURL: "http://www.example.com/12345678/photo.png",
    disabled: Boolean(req.body.disabled),
  };
  // console.log(status);
  firebase.auth().updateUser(uid, user)
  .then(async(update) => {
    await setCustomUserClaim(uid, status);
    await res.redirect("/users");
  }).catch((err) => {
    next(err);
  });
};
export let deleteAuthenticatedUsers = (req: Request, res: Response, next: NextFunction) => {
  const uid = req.params.id;
  if (req.session.uid == uid) {
    return res.json({error: "Logged in User can not be deleted"});
  }
  firebase.auth().deleteUser(uid)
  .then(data => {
    console.log(data);
    res.json({status: "User Deleted"});
  }).catch(err => {
    next(err);
  });
};

const setCustomUserClaim = (uid, data) => {
  return firebase.auth().setCustomUserClaims(uid, {admin: data.admin, editor: data.editor, general: data.general}).then(() => {
    console.log("Successfully created new user:");
    }).catch(err => {
      console.log(err);
  });
};

export let getForgot = (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  res.render("account/forgot", {
    title: "Forgot Password"
  });
};














/**
 * GET /account
 * Profile page.
 */
export let getAccount = (req: Request, res: Response) => {
  res.render("account/profile", {
    title: "Account Management"
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
export let postUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
  req.assert("email", "Please enter a valid email address.").isEmail();
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash("errors", errors);
    return res.redirect("/account");
  }

  User.findById(req.user.id, (err, user: UserModel) => {
    if (err) { return next(err); }
    user.email = req.body.email || "";
    user.profile.name = req.body.name || "";
    user.profile.gender = req.body.gender || "";
    user.profile.location = req.body.location || "";
    user.profile.website = req.body.website || "";
    user.save((err: WriteError) => {
      if (err) {
        if (err.code === 11000) {
          req.flash("errors", { msg: "The email address you have entered is already associated with an account." });
          return res.redirect("/account");
        }
        return next(err);
      }
      req.flash("success", { msg: "Profile information has been updated." });
      res.redirect("/account");
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
export let postUpdatePassword = (req: Request, res: Response, next: NextFunction) => {
  req.assert("password", "Password must be at least 4 characters long").len({ min: 4 });
  req.assert("confirmPassword", "Passwords do not match").equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash("errors", errors);
    return res.redirect("/account");
  }

  User.findById(req.user.id, (err, user: UserModel) => {
    if (err) { return next(err); }
    user.password = req.body.password;
    user.save((err: WriteError) => {
      if (err) { return next(err); }
      req.flash("success", { msg: "Password has been changed." });
      res.redirect("/account");
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
export let postDeleteAccount = (req: Request, res: Response, next: NextFunction) => {
  User.remove({ _id: req.user.id }, (err) => {
    if (err) { return next(err); }
    req.logout();
    req.flash("info", { msg: "Your account has been deleted." });
    res.redirect("/");
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
export let getOauthUnlink = (req: Request, res: Response, next: NextFunction) => {
  const provider = req.params.provider;
  User.findById(req.user.id, (err, user: any) => {
    if (err) { return next(err); }
    user[provider] = undefined;
    user.tokens = user.tokens.filter((token: AuthToken) => token.kind !== provider);
    user.save((err: WriteError) => {
      if (err) { return next(err); }
      req.flash("info", { msg: `${provider} account has been unlinked.` });
      res.redirect("/account");
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
export let getReset = (req: Request, res: Response, next: NextFunction) => {
  res.render("account/reset", {
    title: "Password Reset"
  });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
export let postReset = (req: Request, res: Response, next: NextFunction) => {
  req.assert("password", "Password must be at least 4 characters long.").len({ min: 4 });
  req.assert("confirm", "Passwords must match.").equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash("errors", errors);
    return res.redirect("back");
  }

  async.waterfall([
    function resetPassword(done: Function) {
      User
        .findOne({ passwordResetToken: req.params.token })
        .where("passwordResetExpires").gt(Date.now())
        .exec((err, user: any) => {
          if (err) { return next(err); }
          if (!user) {
            req.flash("errors", { msg: "Password reset token is invalid or has expired." });
            return res.redirect("back");
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save((err: WriteError) => {
            if (err) { return next(err); }
            req.logIn(user, (err) => {
              done(err, user);
            });
          });
        });
    },
    function sendResetPasswordEmail(user: UserModel, done: Function) {
      const transporter = nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: "express-ts@starter.com",
        subject: "Your password has been changed",
        text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash("success", { msg: "Success! Your password has been changed." });
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect("/");
  });
};

/**
 * GET /forgot
 * Forgot Password page.
 */


/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
export let postForgot = (req: Request, res: Response, next: NextFunction) => {
  req.assert("email", "Please enter a valid email address.").isEmail();
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash("errors", errors);
    return res.redirect("/forgot");
  }
  // async.waterfall([
  //   function createRandomToken(done: Function) {
  //     crypto.randomBytes(16, (err, buf) => {
  //       const token = buf.toString("hex");
  //       done(err, token);
  //     });
  //   },
  //   function setRandomToken(token: AuthToken, done: Function) {
  //     User.findOne({ email: req.body.email }, (err, user: any) => {
  //       if (err) { return done(err); }
  //       if (!user) {
  //         req.flash("errors", { msg: "Account with that email address does not exist." });
  //         return res.redirect("/forgot");
  //       }
  //       user.passwordResetToken = token;
  //       user.passwordResetExpires = Date.now() + 3600000; // 1 hour
  //       user.save((err: WriteError) => {
  //         done(err, token, user);
  //       });
  //     });
  //   },
  //   function sendForgotPasswordEmail(token: AuthToken, user: UserModel, done: Function) {
  //     const transporter = nodemailer.createTransport({
  //       service: "SendGrid",
  //       auth: {
  //         user: process.env.SENDGRID_USER,
  //         pass: process.env.SENDGRID_PASSWORD
  //       }
  //     });
  //     const mailOptions = {
  //       to: user.email,
  //       from: "hackathon@starter.com",
  //       subject: "Reset your password on Hackathon Starter",
  //       text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
  //         Please click on the following link, or paste this into your browser to complete the process:\n\n
  //         http://${req.headers.host}/reset/${token}\n\n
  //         If you did not request this, please ignore this email and your password will remain unchanged.\n`
  //     };
  //     transporter.sendMail(mailOptions, (err) => {
  //       req.flash("info", { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
  //       done(err);
  //     });
  //   }
  // ], (err) => {
  //   if (err) { return next(err); }
  //   res.redirect("/forgot");
  // });
};
