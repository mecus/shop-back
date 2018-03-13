// REST API APPLICATION FOR URGY SHOP
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
import * as cors from "cors";
import expressValidator = require("express-validator");
const FirebaseStore = require('connect-session-firebase')(session);

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });

// REST API ENDPOINTS //
import { getApiDepartment, postApiDepartment,
  removeApiDepartment } from "./controllers/api-v1/department";
import { postApiAisle, removeApiAisle } from "./controllers/api-v1/aisle";
import { postApiCategory, removeApiCategory } from "./controllers/api-v1/category";
import { postApiProduct, updateApiProduct,
  deleteApiProduct, postApiBrand, removeApiBrand, getApiBrands } from "./controllers/api-v1/product";
import { postUserApiRegistration, getApiUsers,
  postUpdateApiUser,
  deleteApiUser,
  postApiPasswordReset,
  postUserApiForgottenPassword} from "./controllers/api-v1/user";
import { sgmail } from "./config/sendgrid.config";
import { createOrder, deleteOrder, getCustomerOrders, updateCustomerOrder } from "./controllers/api-v1/orders";
import { getToken, postTransaction, createPaymentMethod, getCustomer } from './controllers/payment/checkout';
import { creditCardTransaction } from './controllers/payment/creditCard';
import { paypalTransaction } from './controllers/payment/paypal';

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

// app.use((req, res, next)=>{
//   console.log(process.env.SENDGRID_API_KEY);
//   next();
// })
app.get('/mail', sgmail);

/** API ENDPOINT */
app.get('/api_v1/departments', getApiDepartment);
app.post('/api_v1/departments', postApiDepartment);
app.delete('/api_v1/departments/', removeApiDepartment);
app.post('/api_v1/aisles', postApiAisle);
app.delete('/api_v1/aisles/', removeApiAisle);
app.post('/api_v1/category', postApiCategory);
app.delete('/api_v1/category/', removeApiCategory);
app.post('/api_v1/products', postApiProduct);
app.patch('/api_v1/products/', updateApiProduct);
app.delete('/api_v1/products/', deleteApiProduct);
app.get('/api_v1/brands', getApiBrands);
app.post('/api_v1/brands', postApiBrand);
app.delete('/api_v1/brands/', removeApiBrand);

/** USER API ENDPOINT */
app.get('/api_v1/users', getApiUsers);
app.post('/api_v1/users/', postUserApiRegistration);
app.patch('/api_v1/users/', postUpdateApiUser);
app.delete('/api_v1/users/', deleteApiUser);
app.post('/api_v1/users/password_reset', postApiPasswordReset);
app.post('/api_v1/users/password_email', postUserApiForgottenPassword);

/** CUSTOMER ENDPOINT */
app.get('/api_v1/get_customer', getCustomer);

/** ORDERS ENDPOINT */
app.post('/api_v1/orders', createOrder);
app.delete('/api_v1/delete_order', deleteOrder);
app.get('/api_v1/customer_orders', getCustomerOrders);
app.post('/api_v1/update_order', updateCustomerOrder);

/** CHECKOUT ROUTES */
app.get('/api_v1/gettoken', getToken);
app.post('/api_v1/transaction', postTransaction);
app.post('/api_v1/payment_method', createPaymentMethod);

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