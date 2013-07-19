/*******************************************************************
* MailChimp transactional email worker
* v.0.0.1
********************************************************************/

var mailchimp = require('mailchimp').MandrillAPI
    , config = require('../config.js').config.mailchimp
    , api = new mailchimp(config.key, {version: '1.0', secure: false })
    , Q = require('q')
  	, kue = require('kue')
  	, jobs = kue.createQueue()
  	, mail = require('./mail')
    , db = require('../lib/db');

jobs.process('registration confirmation', 10, function(job, done) {
	mail.create_registration(job.data)
	.then(function(data) {
		Q.ninvoke(api, 'messages_send', data)
		.then(function(resp) {
      console.log('completed sending mail: ', resp);
			done();
		})
		.fail(function(err) {
			console.log('registration confirmation worker: failed to send mail');
      done(err);
		});
	})
	.fail(function(err) {
		done(err);
	});
});

jobs.process('order confirmation', 10, function(job, done) {
  db.get('orders', job.data.order_id)
  .then(function(doc) {
    doc.user = {
      name: job.data.name,
      email: job.data.email
    };
    mail.create_new_order(doc)
    .then(function(data) {
      Q.ninvoke(api, 'messages_send', data)
      .then(function(resp) {
        console.log('completed sending mail: ', resp);
        done();
      })
      .fail(function(err) {
        console.log('new order worker: failed to send mail ', err);
        done(err);
      });
    })
    .fail(function(err) {
      console.log('new order worker: failed to create mail template');
      done(err);
    });
  })
  .fail(function(err) {
    console.log('new order worker: failed to get order detail from db ', err);
    done(err);
  })
});

jobs.process('payment confirmation', 10, function(job, done) {
  var order_id = job.data;

  db.get('orders', order_id)
  .then(function(order) {
    mail.create_payment_conf(order)
    .then(function(data) {
      Q.ninvoke(api, 'messages_send', data)
      .then(function(resp) {
        done();
      })
      .fail(function(err) {
        console.log('failed to send message', err);
        done(err);
      });
    })
    .fail(function(err) {
      console.log('failed to get mail template', err);
      done(err);
    });
  })
  .fail(function(err) {
    console.log('failed to get order from db', err);
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
