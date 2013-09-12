var db = require('../lib/db')
 	, kue = require('kue')
 	, jobs = kue.createQueue()
 	, crypto = require('crypto');
/*******************************************************************
* Orders service
* REST API for order processing
*
* Order status:
* messages: 
* 0 - created
* 1 - accepted (order has no errors and will be processed)
* 2 - processing (order is in progress)
* 3 - completed (order completed printing and is ready to be shipped)
* 4 - shipped (shipping tracking number must be added to the order record)
* 5 - paid
* 6 - failed to create order
* 7 - order was not accepted, containing errors and need further info
* 8 - cannot ship because of incorrect shipping detail
* 9 - payment problem
********************************************************************/

var status_messages = [
	'Order submitted successfully'
	, 'Order accepted and will begin processing'
	, 'Order is being processed'
	, 'Order has completed'
	, 'Order has been shipped'
	, 'Order is fully paid'
	, 'Failed to create order'
	, 'Order was not accepted, more information is required'
	, 'Cannot ship order due to incomplete information'
	, 'There was a problem with processing the payment'
];

module.exports = exports = {
	list: function(req, resp, next) {
		if (req.session && 'name' in req.session) {
			if ('id' in req.params) {
				db.get('orders', req.params.id)
				.then(function(doc) {
					if (doc.user_id === req.session.user_id || req.session.group === 'admin') resp.json(doc);
					else resp.json({error: {code: 0, message: 'permission denied'}});
				})
				.fail(function(err) {
					resp.json({error: {code: 0, message: 'failed to look up order'}});
				});
			} else if ('group' in req.query) {
				if (req.query.group === req.session.group) {
					db.get('orders', null)
					.then(function(doc) {
						resp.json(doc);
					})
					.fail(function(err) {
						resp.json({error: {code: 0, message: 'failed to look up orders'}});
					});
				}
			} else {
				db.get_by_userid('orders', req.session.user_id)
				.then(function(doc) {
					resp.json(doc);
				})
				.fail(function(err) {
					resp.json({error: {code: 0, message: 'failed to look up orders'}});
				});
			}
		} else {
			resp.json({error: {code: 0, message: 'no valid session present'}});
		}
	},
	save: function(req, resp, next) {
		var s = crypto.createHash('md5');
		var items, order, temp, p;
		s.update((Math.floor((Math.random() * 999888))).toString());
		
		if (req.session && 'name' in req.session) {
			items = req.body.items.map(function(v) {
				v.product_id = v._id;
				delete v._id;
				delete v._rev;
				delete v.$$hashKey;
				return v;
			});
			order = {
				  items: items
				, subtotal: parseFloat(req.body.subtotal)
				, shipping: parseFloat(req.body.shipping)
				, total: parseFloat(req.body.subtotal) + parseFloat(req.body.shipping) + parseFloat(req.body.tax)
				, tax: parseFloat(req.body.tax)
				, status_code: status_messages.indexOf(status_messages[0])
				, status_message: status_messages[0]
				, stripe_token_id: req.body.stripe_token.id
				, stripe_token: req.body.stripe_token
				, payment_created_at: new Date().toJSON()
				, payment_updated_at: new Date().toJSON()
				, confirmation_number: s.digest('hex')
				, user: {
					first: req.session.name.first
				  , last: req.session.name.last
				  , email: req.session.email
				}
			};
			temp = {
				  user_id: req.session.user_id
				, name: req.session.name.first
				, email: req.session.email
				, stripe_token: order.stripe_token
			};

			p = jobs.create('create stripe customer', temp);
			p.on('failed', function(e) {
				console.log('create stripe customer job failed: ', temp, e);
				resp.json({error: {code: 5, message: 'Card error'}});
			});
			p.on('complete', function() {
				db.save('orders', req.session.user_id, order)
				.then(function(doc) {
					var j, t;
					delete temp.stripe_token;
					temp.order_id = doc._id;
					
					t = jobs.create('internal order confirmation', temp);
					t.on('failed', function(e) {
						console.log('internal order job failed: ', temp, e);
					});

					j = jobs.create('order confirmation', temp);
					j.on('failed', function(e) {
						console.log('order confirmation job failed: ', temp, e);
					});

					t.save();
					j.save();
					resp.json(doc);
				})
				.fail(function(e) {
					console.log('failed to save order to db ', e);
					resp.json({error: {code: 0, message: 'failed to save order'}});
				});
			});
			p.attempts(3).save();
		} else {
			resp.json({error: {code: 0, message: 'no valid session present'}});
		}
	},
	update: function(req, resp, next) {
		if (req.session && 'name' in req.session) {
			db.update('orders', req.params.id, req.body)
			.then(function(doc) {
				resp.json(doc);
			})
			.fail(function(err) {
				resp.json({error: {code: 0, message: 'failed to update product details'}});	
			});
		} else {
			resp.json({error: {code: 0, message: 'no valid session present'}});
		}
	},
	remove: function(req, resp, next) {
		if (req.session && 'name' in req.session) {
			db.del(req.params.id)
			.then(function(doc) {
				resp.json(doc);
			})
			.fail(function(err) {
				resp.json({error: {code: 0, message: 'failed to delete product'}});
			});
		} else {
			resp.json({error: {code: 0, message: 'no valid session present'}});
		}
	}
}