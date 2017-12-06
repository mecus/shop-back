"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const compression = require("compression"); // compresses requests
const session = require("express-session");
const bodyParser = require("body-parser");
const logger = require("morgan");
const lusca = require("lusca");
const dotenv = require("dotenv");
const mongo = require("connect-mongo");
const flash = require("express-flash");
const path = require("path");
const passport = require("passport");
const expressValidator = require("express-validator");
const MongoStore = mongo(session);
/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });
/**
 * API keys and Passport configuration.
 */
const passportConfig = require("./config/passport");
/**
 * Controllers (route handlers).
 */
const homeController = require("./controllers/home");
const userController = require("./controllers/user");
const apiController = require("./controllers/api");
const contactController = require("./controllers/contact");
const department_1 = require("./controllers/department");
const aisle_1 = require("./controllers/aisle");
const category_1 = require("./controllers/category");
const product_1 = require("./controllers/product");
const selections_1 = require("./controllers/selections");
const adverts_1 = require("./controllers/adverts");
const orders_1 = require("./controllers/orders");
const youtube_1 = require("./controllers/youtube");
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
app.get("/department", department_1.getDepartment);
app.post("/department", department_1.postDepartment);
app.delete("/department/:id", department_1.removeDepartment);
app.get("/aisle/:id", aisle_1.getAisle);
app.post("/aisle", aisle_1.postAisle);
app.delete("/aisle/:id", aisle_1.removeAisle);
app.get("/category/?", category_1.getCategory);
app.post("/category", category_1.postCategory);
app.delete("/category/:id", category_1.removeCategory);
app.post("/upload", department_1.uploadImage);
app.get("/products", product_1.getProducts);
app.get("/product/new/:id", product_1.newProduct);
app.get("/product/edit/:id", product_1.editProduct);
app.get("/products/show/:id", product_1.showProduct);
app.post("/products/new", product_1.postProduct);
app.post("/products/updates", product_1.updateProduct);
app.post("/product/delete", product_1.deleteProduct);
// Adverts Routes
app.get("/adverts", adverts_1.getAdverts);
app.post("/adverts", adverts_1.postAdvert);
app.get("/adverts/:id", adverts_1.deleteAdvert);
app.get("/edit_advert/:id", adverts_1.editAdvert);
app.post("/update_advert", adverts_1.updateAdvert);
// Making Selections for product insert
app.get("/departments", selections_1.selectDepartment);
app.get("/aisles/:id", selections_1.selectAisle);
app.get("/categories/:id", selections_1.selectCategory);
// Orders
app.get("/orders", orders_1.getOrders);
// Youtube Video
app.get("/youtube", youtube_1.getYoutube);
app.post("/youtube/add", youtube_1.postYoutube);
app.get("/youtube/:id", youtube_1.deleteYoutube);
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
app.get("/api/aisle", aisle_1.getAsileJson);
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
        res.render("404", { title: "404", content: "Page not found!" });
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
        return res.render('500', { title: "Database read failed" });
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
//# sourceMappingURL=server.js.map