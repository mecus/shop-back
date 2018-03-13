import * as braintree from 'braintree';
import * as _ from 'lodash';
import { firebase } from "../../config/firebase-config";
import { gateway } from '../../config/paypal-gateway';
import * as waterfall from 'async-waterfall';

// const { Account }       = require('../../../models/account.model');
// const Address       = require('../../../models/address-book.model');
// const Transaction   = require('../../../models/transaction.model');

const db = firebase.firestore();
const Accounts = db.collection('accounts');
const Addresses = db.collection('addresses');

export const creditCardMethod = (req, res)=> {
    const uId = req.body.uid;
    const method = req.body.method;
    // const payNonce = req.body.nonce;
    console.log(method);

    gateway.paymentMethod.create(method, (err, result)=> {
        if(err){
            return res.json({Error: err, msg: "Payment method failed to create", status: "failure"});
        }
        console.log(result);
        res.json({result: result, status: "success", msg: "Payment method was created successfully"});
    });
    // return payNonce;
    // waterfall([
    //     (done)=>{
    //         Accounts.doc(uId).get().then((account)=> {
    //             if(account.exists){
    //                 const data = account.data();
    //                 done(null, data);
    //             }else{
    //                 done(null);   
    //             }
    //         })
    //         .catch((err)=> {
    //             console.log(err);
    //         });
    //     },
    //     (account, done) => {
    //         const addr = Addresses.where('uid', '==', account.uid).where('address_type', '==', 'billing');
    //         addr.get().then((snapshot)=> {
    //             const address = [];
    //             snapshot.forEach(doc => {
    //                 // console.log(doc.data());
    //                 address.push(doc.data());
    //             });

    //             done(null, account, address[0]);
    //         })
    //         .catch((err)=>{
    //             console.log(err);
    //         });
    //     },
    //     (account, address, done) => {
    //         const method = {
    //             customerId: account.account_no,
    //             paymentMethodNonce: payNonce,
    //             creditCard: {
    //                 billingAddress: {
    //                 firstName: account.first_name,
    //                 lastName: account.last_name,
    //                 streetAddress: address.address,
    //                 locality: address.city,
    //                 postalCode: address.post_code,
    //                 countryName: address.country
    //                 }
    //             }

    //         }
    //         done(null, method, account);
    //     },   

    //     // Creating Card Payment Method
    //     (method, done)=> {
    //         gateway.paymentMethod.create(method, (err, result)=> {
    //          done(err, result);
    //         });
    //     }

    // ], (err, result)=> {
        
    //     if(err){
    //         return res.json({status: "failure", Error: err});
    //     }
    //     console.log("FINAL", result);
    //     return res.json({status: "success", result: result});
    // });

    // Account.findOne({uid:queryId}).then(function(account){
    //     Address.find({account_id:account.id}).then(function(address){
    //         // console.log(address[0]);
    //         // console.log(account);
    //         var newcustomer = {
    //             firstName: account.first_name,
    //             lastName: account.last_name,
    //             email: account.email,
    //             phone: 0+account.telephone.mobile,
    //             paymentMethodNonce: payNonce,
    //             creditCard: {
    //                 billingAddress: {
    //                 firstName: account.first_name,
    //                 lastName: account.last_name,
    //                 streetAddress: address[0].address,
    //                 locality: address[0].city,
    //                 postalCode: address[0].post_code,
    //                 countryName: address[0].country
    //                 }
    //             }

    //         }
    //     if(account.ac_no){
    //         //Run payment method update here
    //         gateway.customer.update(account.ac_no, {
    //             paymentMethodNonce: payNonce,
    //             creditCard: {
    //                 billingAddress: {
    //                 firstName: account.first_name,
    //                 lastName: account.last_name,
    //                 streetAddress: address[0].address,
    //                 locality: address[0].city,
    //                 postalCode: address[0].post_code,
    //                 countryName: address[0].country
    //                 }
    //             }
    //             }, function (err, result) {
    //                 if(err){return res.json({error: err.message})}
    //                 res.json(result);
    //         });
    //     }else{
    //         // console.log(account);
    //          // console.log(newcustomer);
    //         gateway.customer.create(newcustomer, function (err, result) {
    //             if(err){
    //                 console.log(err.message);
    //                 return res.json({error: err.message}); 
    //             }
    //             // true
    //             if(result.success == true){
    //                 console.log(result.customer.id);
    //                 Account.update({_id:account.id}, {$set: {ac_no:result.customer.id}})
    //                 .then(function(){
    //                     res.json({status: "Customer Account Created and Updated"});
    //                 },function(err){
    //                     res.json({error: err.message});
    //                 });
    //             }else{
    //                 console.log(result.success)
    //                 res.json({status: result.success});
    //             }
    //             // e.g. 494019
    //         }); //creating customer ends
    //     }// Else for creating customer ends here
       

    //     },function(err){
    //         res.json({error: err.message});
    //     });
        
    // },function(err){
    //     res.json({error: err.message});
    // })
}

export const creditCardTransaction = (req, res, formatErrors)=> {

    var transactionErrors;
    // var amount = req.body.amount; // In production you should not take amounts directly from clients
    // var nonce = req.body.payment_method_nonce;

    // gateway.transaction.sale({
    //     paymentMethodToken: req.body.token,
    //     amount: req.body.amount,
    //     orderId: req.body.order_no,
    //     options: {
    //         submitForSettlement: true
    //     }
    //     }, function (err, result) {
            
    //         if (result.success || result.transaction) {
    //             // Save Transaction to the database
    //             // res.json(result.transaction.id);
    //             console.log(result.message);
    //             console.log(result.transaction);
    //             let transaction = new Transaction({
    //                 customer_name: result.transaction.customer.firstName+" "+result.transaction.customer.lastName,
    //                 order_no: result.transaction.orderId,
    //                 customer_no: result.transaction.customer.id,
    //                 transaction_id: result.transaction.id,
    //                 email: result.transaction.customer.email,
    //                 telephone: result.transaction.customer.phone,
    //                 amount: result.transaction.amount,
    //                 success: result.success,
    //                 status: result.transaction.status,
    //                 authorization_code: result.transaction.processorAuthorizationCode,
    //                 card_type: result.transaction.creditCard.cardType,
    //                 expiration_date: result.transaction.creditCard.expirationDate,
    //                 card_number: result.transaction.creditCard.maskedNumber,
    //                 card_last4: result.transaction.creditCard.last4,
    //                 payment_token: result.transaction.creditCard.token,
    //                 message: result.message || null
    //             });
          
    //             transaction.save((err, data)=>{
    //                 if(err){res.json({error: err.message})}
    //                 res.json({success: result.success, transaction_id: data._id, payment_status: result.transaction.status, message: result.message || null});
    //             });

    //         } else {
    //             transactionErrors = result.errors.deepErrors();
    //             res.json('error', {msg: formatErrors(transactionErrors)});
    //         }
    // });
}
// module.exports = {creaditCardMethod, creditCardTransaction};