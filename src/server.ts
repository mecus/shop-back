import * as express from "express";
import * as compression from "compression";  // compresses requests
import * as session from "express-session";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as errorHandler from "errorhandler";
import * as lusca from "lusca";
import * as dotenv from "dotenv";
import * as mongo from "connect-mongo";
import * as flash from "express-flash";
import * as path from "path";
import * as mongoose from "mongoose";
import * as passport from "passport";
import expressValidator = require("express-validator");
const FirebaseStore = require('connect-session-firebase')(session);

// const MongoStore = mongo(session);

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });

/**
 * API keys and Passport configuration.
 */
import * as passportConfig from "./config/passport";
import { firebase, authenticate } from "./config/firebase-config";

/**
 * Controllers (route handlers).
 */
import * as homeController from "./controllers/home";
import * as userController from "./controllers/user";
import * as apiController from "./controllers/api";
import * as contactController from "./controllers/contact";
import { getDepartment, postDepartment, removeDepartment, uploadImage } from "./controllers/department";
import { getAisle, postAisle, removeAisle, getAsileJson } from "./controllers/aisle";
import { getCategory, postCategory, removeCategory } from "./controllers/category";
import { getProducts, postProduct, newProduct, editProduct, showProduct, deleteProduct, updateProduct, getApiProducts } from "./controllers/product";
import { selectDepartment, selectAisle, selectCategory } from "./controllers/selections";
import { getAdverts, postAdvert, deleteAdvert, editAdvert, updateAdvert } from "./controllers/adverts";
import { getOrders } from "./controllers/orders";
import { getYoutube, postYoutube, deleteYoutube } from "./controllers/youtube";


const app = express();
/**
 * Express configuration.
 */
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
// app.use(logger("dev"));
app.use(logger('dev', {
  skip: (req, res) => {
      return res.statusCode < 400;
  }, stream: process.stderr
}));
app.use(logger('dev', {
  skip: (req, res) => {
      return res.statusCode >= 400;
  }, stream: process.stdout
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  store: new FirebaseStore({
    database: firebase.database()
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));
// app.use(passport.initialize());
// app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
// app.use((req, res, next) => {
//   // res.locals.user = req.user;
//   console.log("Request Set:", req.session);
//   next();
// });
app.use(express.static(path.join(__dirname, "public")));

/**
 * Primary app routes.
 */
app.use((req, res, next) => {
  if (req.session.uid) {
    res.locals.uid = req.session.uid;
    res.locals.user = req.session.user;
    res.locals.email = req.session.email;
    res.locals.admin = req.session.admin;
    res.locals.editor = req.session.editor;
    res.locals.general = req.session.general;
    next();
  } else {
    next();
  }
});
// app.get("/", (req, res, next) => {
//  res.redirect("/login");
// });
app.get("/", homeController.index);
app.get("/dashboard", authenticate, homeController.dashboard);
app.get("/department", authenticate, getDepartment);
app.post("/department", authenticate, postDepartment);
app.delete("/department/:id", authenticate, removeDepartment);
app.get("/aisle/:id", authenticate, getAisle);
app.post("/aisle", authenticate, postAisle);
app.delete("/aisle/:id", authenticate, removeAisle);
app.get("/category/?", authenticate, getCategory);
app.post("/category", authenticate, postCategory);
app.delete("/category/:id", authenticate, removeCategory);
app.post("/upload", authenticate, uploadImage);

app.get("/products", authenticate, getProducts);
app.get("/product/new/:id", authenticate, newProduct);
app.get("/product/edit/:id", authenticate, editProduct);
app.get("/products/show/:id", authenticate, showProduct);
app.post("/products/new", authenticate, postProduct);
app.post("/products/updates", authenticate, updateProduct);
app.post("/product/delete", authenticate, deleteProduct);

// Adverts Routes
app.get("/adverts", authenticate, getAdverts);
app.post("/adverts", authenticate, postAdvert);
app.get("/adverts/:id", authenticate, deleteAdvert);
app.get("/edit_advert/:id", authenticate, editAdvert);
app.post("/update_advert", authenticate, updateAdvert);

// Making Selections for product insert
app.get("/departments", authenticate, selectDepartment);
app.get("/aisles/:id", authenticate, selectAisle);
app.get("/categories/:id", authenticate, selectCategory);

// Orders
app.get("/orders", authenticate, getOrders);

// Youtube Video
app.get("/youtube", authenticate, getYoutube);
app.post("/youtube/add", authenticate, postYoutube);
app.get("/youtube/:id", authenticate, deleteYoutube);

app.get("/login", (req, res, next) => {
  if (req.session && req.session.uid) {
    return res.redirect("/dashboard");
  }
  next();
}, userController.getLogin);
app.post("/login", userController.postLogin);
app.get("/logout", userController.logout);
app.get("/forgot", userController.getForgot);
app.post("/forgot", userController.postForgot);
app.get("/reset/:token", userController.getReset);
app.post("/reset/:token", userController.postReset);
app.get("/signup", userController.getSignup);
app.post("/signup", userController.postSignup);
app.get("/users", authenticate, userController.getAuthenticatedUsers);
app.get("/deleteuser/:id", authenticate, userController.deleteAuthenticatedUsers);
app.get("/updateuser/:id", authenticate, userController.getUpdateAuthenticatedUser);
app.post("/updateuser", authenticate, userController.postUpdateAuthenticatedUser);
app.get("/contact", contactController.getContact);
app.post("/contact", contactController.postContact);
app.get("/account", passportConfig.isAuthenticated, userController.getAccount);
app.post("/account/profile", passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post("/account/delete", passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get("/account/unlink/:provider", passportConfig.isAuthenticated, userController.getOauthUnlink);

/**
 * API examples routes.
 */
app.get("/api/aisle", getAsileJson);
app.get("/api/products", authenticate, getApiProducts);
app.get("/api", apiController.getApi);
app.get("/api/facebook", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email", "public_profile"] }));
app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
  // res.redirect(req.session.returnTo || "/");
});

app.use((req, res, next) => {
  if (res.status(404)) {
    res.render("404", {title: "404", content: "Page not found!"});
  }
  res.status(500);
});
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
    // res.render('500', { title: "Something Went Terribly Wrong!", error: err.stack });
  }
  if (err.stack.includes("Endpoint read failed")) {
    res.status(500);
    return res.render('500', { title: "Database read failed"});
  }
  if (req.next) {
    return next(err);
  }
  res.status(500);
  console.error("AppError", err.stack);

  res.render('500', { title: "Something Went Terribly Wrong!", error: err.stack });
});


/**
 * Error Handler. Provides full stack - remove for production
 */
// app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get("port"), () => {
  // console.log(("  App is running at http://localhost:%d in %s mode"), app.get("port"), app.get("env"));
  console.log("  Press CTRL-C to stop\n");
});

module.exports = app;