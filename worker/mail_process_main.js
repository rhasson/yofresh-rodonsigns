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
  	, mail = require('./mail');

jobs.process('registration confirmation', 2, function(job, done) {
	mail.create_registration(job)
	.then(function(data) {
		Q.ninvoke(mailchimp, 'messages_send', data)
		.then(function(resp) {
			done(data);
		})
		.fail(function(err) {
			done(err);
		});
	})
	.fail(function(err) {
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
