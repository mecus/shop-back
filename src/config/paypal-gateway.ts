import * as braintree from 'braintree';
import * as dotenv from 'dotenv';
dotenv.config({path: '.env'}); 

// environment = process.env.BT_ENVIRONMENT.charAt(0).toUpperCase() + process.env.BT_ENVIRONMENT.slice(1);

// ADD CONFIGURATION TO ENV
export const gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: 'kqr9yhmf2vh6mgks',
  publicKey: 'jfz3d5p27yzyptj4',
  privateKey: '9e5f00bb7a29c3c49398a9287c6d13d1'
});
