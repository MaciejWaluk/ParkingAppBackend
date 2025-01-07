var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer')


const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
})

const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD
  },
  secure: false
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Express on vercel')
});

router.get('/config', function(req, res) {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  })
})

router.post('/create_payment_intent', async function(req, res) {
  try {
    const {amount} = req.body
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'pln',
      automatic_payment_methods: {
        enabled: true
      }
    })

    res.send({
      clientSecret: paymentIntent.client_secret
    })
  } catch (error) {
      return res.status(400).send({
        error: {
          message: error.message
        }
      })
    }
})

router.post('/send_email', function(req, res) {
  const {to, subject, html} = req.body
  const mailData = {
    from: process.env.GMAIL_EMAIL,
    to: to,
    subject: subject,
    html: html,
  }

  transporter.sendMail(mailData, (error, info) => {
    if(error) {
      return res.status(400).send({error: {
        message: error.message
        }})
    }
    return res.status(200).send()
  })
})

module.exports = router;
