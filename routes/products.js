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
				req.body.thumb = process.cwd() + '/public/img/' + l + '/thumb/' + req.body.thumb;
				req.body.thumb_large = process.cwd() + '/public/img/' + l + '/thumb_large/' + req.body.thumb;
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
			if ('thumb' in req.body && 'sku' in req.body) {
				var l = req.body.sku[0].toUpperCase();
				req.body.thumb = process.cwd() + '/public/img/' + l + '/thumb/' + req.body.thumb;
				req.body.thumb_large = process.cwd() + '/public/img/' + l + '/thumb_large/' + req.body.thumb;
			}
			db.update('products', req.params.id, req.body)
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