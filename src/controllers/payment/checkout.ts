import * as braintree from 'braintree';
import { Request, Response } from 'express';
import * as _ from 'lodash';
import { gateway } from '../../config/paypal-gateway';
import { firebase } from "../../config/firebase-config";
import * as waterfall from 'async-waterfall';
import { creditCardMethod, creditCardTransaction } from './creditCard';
const db = firebase.firestore();
const Accounts = db.collection('accounts');
const Addresses = db.collection('addresses');
const Transactions = db.collection('transactions');

const TRANSACTION_SUCCESS_STATUSES = [
  braintree.Transaction.Status.Authorizing,
  braintree.Transaction.Status.Authorized,
  braintree.Transaction.Status.Settled,
  braintree.Transaction.Status.Settling,
  braintree.Transaction.Status.SettlementConfirmed,
  braintree.Transaction.Status.SettlementPending,
  braintree.Transaction.Status.SubmittedForSettlement
];

const formatErrors = (errors) =>{
  var formattedErrors = '';

  for (var i in errors) { // eslint-disable-line no-inner-declarations, vars-on-top
    if (errors.hasOwnProperty(i)) {
      formattedErrors += 'Error: ' + errors[i].code + ': ' + errors[i].message + '\n';
    }
  }
  return formattedErrors;
}

export const getToken = (req: Request, res: Response) => {
    // res.json({clientToken: "9e5f00bb7a29c3c49398a9287c6d13d1"});
    gateway.clientToken.generate({}, (err, response) =>{
        if(err){
            return res.json({message: err});
        }

        res.json({clientToken: response.clientToken});
    });
}

// Creating Payment Method For all Methods (Cards and Paypal)
export const createPaymentMethod = (req: Request, res: Response) => {
    const uId = req.body.uid;
    const method = req.body.method;
    // console.log(method);

    gateway.paymentMethod.create(method, (err, result)=> {
        if(err){
            return res.json({Error: err, msg: "Payment method failed to create", status: "failure"});
        }
        console.log(result);
        res.json({result: result, status: "success", msg: "Payment method was created successfully"});
    });
}

export const getCustomer = (req: Request, res: Response) => {
    var customerId = req.query.id;
    
    gateway.customer.find(customerId, (err, customer)=> {
        if(err){
            console.log(err);
            return res.json({error: err.message});
        }
        // let ld = _.lastIndexOf(customer.creditCards);
        const returnPaypal = _.last(_.orderBy(customer.paypalAccounts, ['createdAt'], ['asc']));
        const returnCard = _.last(_.filter(customer.creditCards, {'default': true}));
        console.log(customer);
        res.json({card: returnCard, paypal: returnPaypal});
    })
}


export const postTransaction = (req: Request, res: Response) => {
 
    const payment = req.body.payment;
    var transactionErrors;
    payment.amount = (req.body.payment.amount).toFixed(2);
    // console.log(payment);
    // // var amount = req.body.amount; // In production you should not take amounts directly from clients
    // // var nonce = req.body.payment_method_nonce;
    waterfall([
        (done) => {
            gateway.transaction.sale(payment, (err, result) => {
                done(err, result);
            });
        },
        (result, done)=> {
            if(result.success || result.transaction){
                const transaction = {
                    customer_name: result.transaction.customer.firstName+" "+result.transaction.customer.lastName,
                    order_no: result.transaction.orderId,
                    customer_no: result.transaction.customer.id,
                    transaction_id: result.transaction.id,
                    email: result.transaction.customer.email,
                    telephone: result.transaction.customer.phone,
                    amount: result.transaction.amount,
                    success: result.success,
                    status: result.transaction.status,
                    createdAt: result.transaction.createdAt,
                    authorization_code: result.transaction.processorAuthorizationCode,
                    card_type: result.transaction.creditCard.cardType || null,
                    expiration_date: result.transaction.creditCard.expirationDate || null,
                    card_number: result.transaction.creditCard.maskedNumber || null,
                    card_last4: result.transaction.creditCard.last4 || null,
                    payment_token: result.transaction.creditCard.token || null
                }
                Transactions.add(transaction).then((ref)=>{
                    done(null, {transaction: result, record: ref});
                })
                .catch((err)=>{
                    console.log(err);
                });
            }
        }

    ], (err, result)=>{
        if(err){
            return res.json({status: "failure", msg: "Failed to create transaction", Error: err});
        }
        res.json({status: "success", result: result});
    });

    // gateway.transaction.sale(payment, (err, result)=> {

    //         if(err){
    //             transactionErrors = result.errors.deepErrors();
    //             return res.json({status: "failure", msg: "Failed to create transaction", Error: formatErrors(transactionErrors)});
    //         }
    //         if(result.error){
    //             return res.json({status: "failure", msg: result.error.message,});
    //         }
    //         res.json({status: "success", result: result});
    //         if (result.success || result.transaction) {
    //             // Save Transaction to the database
    //             // res.json(result.transaction.id);
    //             console.log(result.transaction);
    //             let transaction = {
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
    //                 payment_token: result.transaction.creditCard.token
    //             };

    //         }
    // });

}