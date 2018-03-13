import * as async from "async";
import * as crypto from "crypto";
import * as bcrypt from "bcrypt-nodejs";
import * as nodemailer from "nodemailer";
import * as passport from "passport";
import { default as User, UserModel, AuthToken } from "../../models/User";
import { Request, Response, NextFunction } from "express";
import { LocalStrategyInfo } from "passport-local";
import { WriteError } from "mongodb";
const request = require("express-validator");
import { firebase, setUserSession } from "../../config/firebase-config";
import { transporter, mailAccount } from '../../config/mailer';
import { gateway } from "../../config/paypal-gateway";
const db = firebase.firestore();
const userAccounts = db.collection('accounts');
const userAddresses = db.collection('addresses');

export let postUserApiRegistration = (req: Request, res: Response) => {
  // res.json({newUser: req.body});
  const user = req.body.user;
  const account = req.body.account;
  const address = req.body.addresses;
  firebase.auth().createUser(user)
    .then(async (userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
     const payAccount = await createPaymentUser(account);
     if(payAccount){
      account.account_no = payAccount;
     }
     const result1 = await setCustomUserClaim(userRecord.uid, {privilege: "user"});
     const result2 = await creatUserAccount(userRecord.uid, account);
     const result3 = await creatUserAddress(userRecord.uid, address);
     const usertoken = await firebase.auth().createCustomToken(userRecord.uid);
     res.json({msg: "User Record Created", token: usertoken, payacNo: payAccount, user: userRecord, accountStatus: result2, addressStatus: result3});
    })
    .catch((error) => {
      res.json({msg: "Error creating new user:", error: error});
    });
};

export let getApiUsers = (req: Request, res: Response) => {
  firebase.auth().listUsers()
  .then(listUsers => {
    const users = listUsers.users;
    res.json(users);
  }).catch(err => {
    res.json({msg: "Error Retriving Users", error: err});
  });
};

export let postUpdateApiUser = (req: Request, res: Response) => {
  const uid = req.query.uid;
  const status = {
    privilege: req.body.privilege
  };
  const user = req.body;
  // console.log(status);
  firebase.auth().updateUser(uid, user)
  .then((update) => {
    const result = setCustomUserClaim(uid, status);
    if (result == "success") {
      res.json({msg: "user updated successfully"});
    } else {
      res.json({msg: "user update failed"});
    }
  }).catch((err) => {
    res.json({msg: "Error updating user", error: err});
  });
};
export let deleteApiUser = (req: Request, res: Response) => {
  const uid = req.params.id;
  firebase.auth().deleteUser(uid)
  .then(data => {
    console.log(data);
    res.json({msg: "User Deleted", ref: data.id});
  }).catch(err => {
    res.json({msg: "Error deleting user", error: err});
  });
};

const setCustomUserClaim = (uid, data) => {
  return firebase.auth().setCustomUserClaims(uid, { privilege: data.privilege }).then( () => {
    console.log("Successfully created new user:");
    return "success";
    }).catch(err => {
      console.log(err);
      return "failure";
  });
};

/** When creating authenticated user, 
the following should be created as well */
const createPaymentUser = (user) => {
  const customer = {
    firstName: user.first_name,
    lastName: user.last_name,
    company: "Braintree",
    email: user.email,
    phone: user.telephone.mobile,
    fax: "614.555.5678",
    website: "www.example.com"
  }
  return new Promise((resolve, reject)=>{
    gateway.customer.create(customer, (err, result)=>{
      if(err){
        reject(err);
      }else{
        console.log("PAYAC: ", result);
        resolve(result.customer.id);
      }
    });
  });
}
const creatUserAccount = (id, account) => {
  account.uid = id;
  return userAccounts.doc(id).set(account).then(ref => {
   return "success";
  })
  .catch((err) => {
    return "failure";
  });
};
const creatUserAddress = (id, address) => {
  address.uid = id;
  return userAddresses.add(address).then(ref => {
   return "addressSuccess";
  })
  .catch((err) => {
    return "addressFailure";
  });
};
/***************************************/

/**
 * POST /reset/:token
 * Process the reset password request.
 */
export let postApiPasswordReset = (req: Request, res: Response) => {

  async.waterfall([
    function getResetPasswordUser(done: Function) {
      const resetUser = userAccounts.where('passwordResetToken', '==', req.params.token);
      resetUser.get().then(user => {
        const doc = user.docs[0].data();
        done(undefined, doc);
      }).catch(err => {
        res.json({msg: "Error retrieving user for password reset", error: err});
      });
    },
    function resetPassword(user, done: Function) {
      const userUp = {
        password: req.body.password
      };
      firebase.auth().updateUser(user.uid, userUp)
      .then((update) => {
        console.log(update);
        done(undefined, update.email, update.uid);
      }).catch((err) => {
        res.json({msg: "Error resitting user password", error: err});
      });
    },
    function sendResetPasswordEmail(email, uid, done: Function) {
      const mailOptions = {
        to: email,
        from: `"Support 👻" <${mailAccount.email}>`,
        subject: "Your password has been changed",
        text: `Hello,\n\nThis is a confirmation that the password for your account ${email} has just been changed.\n`
      };
      transporter.sendMail(mailOptions, (err, ref) => {
        console.log("Email Sent", ref);
        done(err);
      });
    }
  ], (err) => {
    if (err) {
      return res.json({msg: "Error Processing Request", error: err});
    }
    res.json({msg: "Success! Your password has been changed."});
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
export let postUserApiForgottenPassword = (req: Request, res: Response, next: NextFunction) => {

  async.waterfall([
    (done: Function) => {
      crypto.randomBytes(16, (err, buf) => {
        const token = buf.toString("hex");
        done(err, token);
      });
    },
    (token: AuthToken, done: Function) => {
      const userObj = {
        passwordResetToken: token,
        passwordResetExpires: Date.now() + 3600000,
        uid: undefined
      };
      firebase.auth().getUserByEmail(req.body.email).then(user => {
        // console.log("Found User Account", user);
        if (!user) {
          // req.flash("errors", { msg: "Account with that email address does not exist." });
          return res.json({msg: "Account with that email address does not exist." });
        }
        // done(token, user);
        userObj.uid = user.uid;
        userAccounts.doc(user.uid).set(userObj).then(ref => {
          // console.log("token saved", ref, token, user);
          done(undefined, token, user);
        }).catch(err => {
         res.json({msg: "Error Saving Password Reset Token to user account."});
        });
      }).catch(err => {
        console.log(err);
        // req.flash("errors", { msg: "Account with that email address does not exist." });
        res.json({msg: "Account with that email address does not exist." });
      });
    },
    (token, user, done: Function) => {
      const mailOptions = {
      to: user.email,
      from: `"Tech Support 👻" <${mailAccount.email}>`,
      subject: "Reset your password on Urgy",
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
      transporter.sendMail(mailOptions, (err, info) => {
      console.log("Message sent:", info);
      // req.flash("info", { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
      done(err);
      });
    }
  ], (err) => {
    if (err) {
      return res.json({msg: "Failuer: Processing Password Reset Token", error: err});
    }
    res.json({msg: "Success: Processing Password Reset Token"});
  });
};
/***************************************/
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
    return res.redirect("/user/profile");
  }
  const uid = req.body.uid;
  const user =  {
    email: req.body.email,
    phoneNumber: req.body.telephone,
    // password: req.body.password,
    displayName: req.body.display_name,

  };
  // console.log(status);
  // firebase.auth().updateUser(uid, user)
  // .then(async(update) => {
  //   await setCustomUserClaim(uid, status);
  //   await res.redirect("/users");
  // }).catch((err) => {
  //   next(err);
  // });

  // User.findById(req.user.id, (err, user: UserModel) => {
  //   if (err) { return next(err); }
  //   user.email = req.body.email || "";
  //   user.profile.name = req.body.name || "";
  //   user.profile.gender = req.body.gender || "";
  //   user.profile.location = req.body.location || "";
  //   user.profile.website = req.body.website || "";
  //   user.save((err: WriteError) => {
  //     if (err) {
  //       if (err.code === 11000) {
  //         req.flash("errors", { msg: "The email address you have entered is already associated with an account." });
  //         return res.redirect("/account");
  //       }
  //       return next(err);
  //     }
  //     req.flash("success", { msg: "Profile information has been updated." });
  //     res.redirect("/account");
  //   });
  // });
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

