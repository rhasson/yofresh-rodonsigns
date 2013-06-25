var db = require('../lib/db');

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
			db.get('orders', req.params.id || null)
			.then(function(doc) {
				resp.json(doc);
			})
			.fail(function(err) {
				resp.json({error: {code: 0, message: 'failed to look up product'}});
			});
		} else {
			resp.json({error: {code: 0, message: 'no valid session present'}});
		}
	},
	save: function(req, resp, next) {
		if (req.session && 'name' in req.session) {
			var items = req.body.items.map(function(v) {
				v.product_id = v._id;
				delete v._id;
				delete v._rev;
				delete v.$$hashKey;
				return v;
			});
			var order = {
				items: items
				, subtotal: req.body.subtotal
				, shipping: req.body.shipping
				, total: req.body.subtotal + req.body.shipping
				, status_code: status_messages.indexOf(status_messages[0])
				, status_message: status_messages[0]
				, payment_created_at: ''
				, payment_updated_at: ''
			};

			db.save('orders', req.session.user_id, order)
			.then(function(doc) {
				resp.json(doc);
			})
			.fail(function(err) {
				resp.json({error: {code: 0, message: 'failed to save product'}});
			});
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