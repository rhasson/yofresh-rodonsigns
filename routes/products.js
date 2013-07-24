var db = require('../lib/db');

module.exports = exports = {
	list: function(req, resp, next) {
		if (req.session && 'name' in req.session) {
			db.get('products', req.params.id || null)
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
			if ('thumb' in req.body && 'sku' in req.body) {
				var l = req.body.sku[0].toUpperCase();
				var n = req.body.thumb;
				req.body.thumb = 'img/' + l + '/thumb/' + n;
				req.body.thumb_large = 'img/' + l + '/thumb_large/' + n;
			}
			db.save('products', req.session.user_id, req.body)
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
			var body = req.body.body;
			if ('thumb' in body && 'sku' in body) {
				var l = body.sku[0].toUpperCase();
				var n = body.thumb;
				body.thumb = 'img/' + l + '/thumb/' + n;
				body.thumb_large = 'img/' + l + '/thumb_large/' + n;
			}
			db.update('products', req.params.id, body)
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