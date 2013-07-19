/*******************************************************************
* Payment processing worker
* v.0.0.1
********************************************************************/

var stripe = require('stripe')(require('../config').config.stripe.test_secret)
    , Q = require('q')
  	, kue = require('kue')
  	, jobs = kue.createQueue()
    , db = require('../lib/db');

jobs.process('create stripe customer', 10, function(job, done) {
  console.log('job:' ,job.data)
  db.get('users', job.data.user_id)
  .then(function(user) {
    if (!('stripe_customer' in user) || (user.stripe_customer.active_card.fingerprint !== job.data.stripe_token.card.fingerprint)) {
      Q.ninvoke(stripe.customers, 'create', {
        card: job.data.stripe_token.id
        , email: job.data.email
      })
      .then(function(customer) {
        console.log('CREATED STRIPE CUSTOMER', customer.id);
        return db.update('users', job.data.user_id, {stripe_customer: customer})
      })
      .fail(function(e) {
        console.log('failed to create stripe customer: ', e);
        done(e);
      });
    } else {
      done();
    }
  })
  .then(function(doc) {
    done();
  })
  .fail(function(e) {
    done(e);
  });
});

jobs.process('capture charges', 10, function(job, done) {
  var order_id = job.data.id
    , order = job.data.order
    , user_id = job.data.user_id;

  db.get('users', user_id)
  .then(function(user) {
    Q.ninvoke(stripe.charges, 'create', {
      amount: order.total * 100
    , currency: 'usd'
    , customer: user.stripe_customer.id
    , capture: true
    })
    .then(function(charge) {
      console.log('PAYMENT CAPTURED: ', charge.id);
      return db.update('orders', order_id, {payment: charge});
    })
    .fail(function(err) {
      console.log('strip charge failed: ', err);
      done(err);
    });
  })
  .fail(function(err) {
    console.log('capture charges child worker failed: ', err);
    done(err);
  });
});


process.on('disconnect', function() {
  console.log('Worker disconnected');
  process.exit(1)
});
process.on('error', function(err) {
  console.log('Worker encountered an error: ', err);
  process.exit(1);
});
process.on('close', function() {
  console.log('Worker closed');
  process.exit(1);
});
process.on('exit', function(code, signal) {
  console.log('Worker exited with code: ', code, ' and signal: ', signal);
  process.exit(1);
});
