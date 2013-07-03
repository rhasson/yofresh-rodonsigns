var db = require('../lib/db');

module.exports = exports = {
	list: function(req, resp, next) {
		if (req.session && 'name' in req.session) {
			db.get('users', req.params.id || null)
			.then(function(user) {
				var u = (user instanceof Array) ? (user.length ? user[0] : {}) : user;

				if (!('_id' in u)) resp.json({error: { code: 0, message: 'user not found'}});
				else {
					delete user.password;
					resp.json(user);
				}
			})
			.fail(function(err) {
				console.log('USERS: ', err);
				resp.json({error: {code: 0, message: 'failed to retreive user'}});
			})
		} else {
			resp.json({error: {code: 0, message: 'no valid session present'}});
		}
	},
	save: function(req, resp, next) {
		next();
	},
	update: function(req, resp, next) {
		if (req.session && 'name' in req.session && req.params.id === req.session.user_id) {
			console.log(req.params, req.body)
			delete req.body._id;
			delete req.body._rev;
			db.update('users', req.params.id, req.body)
			.then(function(doc) {
				resp.json(doc);	
			})
			.fail(function(err) {
				resp.json({error: {code: 0, message: 'failed to update user'}});
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
				resp.json({error: {code: 0, message: 'failed to delete user'}});	
			});
		} else {
			resp.json({error: {code: 0, message: 'no valid session present'}});
		}
	}
}