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
      console.log('NO ID')
      Q.ninvoke(stripe.customers, 'create', {
        card: job.data.stripe_token.id
        , email: job.data.email
      })
      .then(function(customer) {
        console.log('UPDATING USER', customer)
        return db.update('users', job.data.user_id, {stripe_customer: customer})
      })
      .fail(function(e) {
        console.log('failed to create stripe customer: ', e);
        done(e);
      });
    } else {
      console.log('ALL GOOD')
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
