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

const MongoStore = mongo(session);

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });

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
import { getProducts, postProduct, newProduct, editProduct, showProduct, deleteProduct, updateProduct } from "./controllers/product";
import { selectDepartment } from "./controllers/selections";

/**
 * API keys and Passport configuration.
 */
import * as passportConfig from "./config/passport";




/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
// mongoose.Promise = global.Promise;
// mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);

// mongoose.connection.on("error", () => {
//   console.log("MongoDB connection error. Please make sure MongoDB is running.");
//   process.exit();
// });



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
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  // store: new MongoStore({
  //   url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
  //   autoReconnect: true
  // })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  // res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  // if (!req.user &&
  //     req.path !== "/login" &&
  //     req.path !== "/signup" &&
  //     !req.path.match(/^\/auth/) &&
  //     !req.path.match(/\./)) {
  //   req.session.returnTo = req.path;
  // } else if (req.user &&
  //     req.path == "/account") {
  //   req.session.returnTo = req.path;
  // }
  next();
});

app.use(express.static(path.join(__dirname, "public")));

/**
 * Primary app routes.
 */
app.get("/", homeController.index);
app.get("/department", getDepartment);
app.post("/department", postDepartment);
app.delete("/department/:id", removeDepartment);
app.get("/aisle/:id", getAisle);
app.post("/aisle", postAisle);
app.delete("/aisle/:id", removeAisle);
app.get("/category/?", getCategory);
app.post("/category", postCategory);
app.delete("/category/:id", removeCategory);
app.post("/upload", uploadImage);

app.get("/products", getProducts);
app.get("/products/new", newProduct);
app.patch("/product/edit/:id", editProduct);
app.get("/products/show/:id", showProduct);
app.post("/products/new", postProduct);
app.post("/products/updates", updateProduct);
app.post("/product/delete", deleteProduct);

app.get("/departments", selectDepartment);

app.get("/login", userController.getLogin);
app.post("/login", userController.postLogin);
app.get("/logout", userController.logout);
app.get("/forgot", userController.getForgot);
app.post("/forgot", userController.postForgot);
app.get("/reset/:token", userController.getReset);
app.post("/reset/:token", userController.postReset);
app.get("/signup", userController.getSignup);
app.post("/signup", userController.postSignup);
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