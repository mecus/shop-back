import * as sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const msg = {
  to: 'design@miscotech.co.uk',
  from: 'shop@urgy.co.uk',
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};


export const sgmail = (req, res) => {
    sgMail.send(msg);
    res.json({status: "sending mail"});
}