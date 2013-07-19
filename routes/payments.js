var db = require('../lib/db')
 	, kue = require('kue')
 	, jobs = kue.createQueue();

module.exports = exports = {
	get: function(req, resp, next) {
	},
	save: function(req, resp, next) {
	},
	update: function(req, resp, next) {
		if (('id' in req.params) && ('body' in req.body) && ('capture_charge' in req.body.body)) {
			if (req.body.body.capture_charge === true) {
				db.get('orders', req.params.id)
				.then(function(doc) {
					var p;
					if (doc.user_id === req.session.user_id) {
						p = jobs.create('capture charges', {
							id: req.params.id
						  , user_id: req.session.user_id
						  , order: doc
						});
						
						p.on('failed', function(e) {
							console.log('capture payment job failed: ', e);
							resp.json({error: {code: 0, message: 'failed to process payment: ' + e}});
						});
						p.on('complete', function() {
							resp.json({id: doc._id});
							j = jobs.create('payment confirmation', doc._id);
							j.on('failed', function(e) {
								console.log('payment confirmation job failed: ', e);
							});
							j.save();
						});
						p.priority('high').attempts(3).save();
					} else {
						resp.json({error: {code: 0, message: 'not authorized to access this record'}});
					}
				})
				.fail(function(err) {
					resp.json({error: {code: 0, message: 'failed to retreive record: ' + err}});
				});
			}
		}
	},
	remove: function(req, resp, next) {
	}
}