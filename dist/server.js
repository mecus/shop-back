"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// REST API APPLICATION FOR URGY SHOP
const express = require("express");
const compression = require("compression"); // compresses requests
const session = require("express-session");
const bodyParser = require("body-parser");
const logger = require("morgan");
const lusca = require("lusca");
const dotenv = require("dotenv");
const cors = require("cors");
const FirebaseStore = require('connect-session-firebase')(session);
/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });
// REST API ENDPOINTS //
const department_1 = require("./api-v1/department");
const aisle_1 = require("./api-v1/aisle");
const category_1 = require("./api-v1/category");
const product_1 = require("./api-v1/product");
const user_1 = require("./api-v1/user");
const app = express();
/**
 * Express configuration.
 */
app.set("port", process.env.PORT || 8080);
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
app.use(cors());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
/** API ENDPOINT */
app.get('/api_v1/departments', department_1.getApiDepartment);
app.post('/api_v1/departments', department_1.postApiDepartment);
app.delete('/api_v1/departments/', department_1.removeApiDepartment);
app.post('/api_v1/aisles', aisle_1.postApiAisle);
app.delete('/api_v1/aisles/', aisle_1.removeApiAisle);
app.post('/api_v1/category', category_1.postApiCategory);
app.delete('/api_v1/category/', category_1.removeApiCategory);
app.post('/api_v1/products', product_1.postApiProduct);
app.patch('/api_v1/products/', product_1.updateApiProduct);
app.delete('/api_v1/products/', product_1.deleteApiProduct);
app.get('/api_v1/brands', product_1.getApiBrands);
app.post('/api_v1/brands', product_1.postApiBrand);
app.delete('/api_v1/brands/', product_1.removeApiBrand);
/** USER API ENDPOINT */
app.get('/api_v1/users', user_1.getApiUsers);
app.post('/api_v1/users/', user_1.postUserApiRegistration);
app.patch('/api_v1/users/', user_1.postUpdateApiUser);
app.delete('/api_v1/users/', user_1.deleteApiUser);
app.post('/api_v1/users/password_reset', user_1.postApiPasswordReset);
app.post('/api_v1/users/password_email', user_1.postUserApiForgottenPassword);
/**
 * Error Handler. Provides full stack - remove for production
 */
// app.use(errorHandler());
/**
 * Start Express server.
 */
app.listen(app.get("port"), () => {
    console.log(("  App Server is running at http://localhost:%d in %s mode"), app.get("port"), app.get("env"));
    console.log("  Press CTRL-C to stop\n");
});
module.exports = app;
//# sourceMappingURL=server.js.map