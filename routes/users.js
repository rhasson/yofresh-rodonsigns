var db = require('../lib/db');

module.exports = exports = {
	list: function(req, resp, next) {
		if (req.session && 'name' in req.session) {
			if ('id' in req.params) {
				db.get('users', req.params.id)
				.then(function(user) {
					var u = (user instanceof Array) ? (user.length ? user[0] : {}) : user;

					if (!('_id' in u)) resp.json({error: { code: 0, message: 'user not found'}});
					else {
						if (u._id === req.session.user_id || req.session.group === 'admin') {
							delete user.password;
							resp.json(user);
						} else {
							resp.json({error: {code: 0, message: 'permission denied'}});
						}
					}
				})
				.fail(function(err) {
					console.log('USERS: ', err);
					resp.json({error: {code: 0, message: 'failed to retreive user'}});
				});
			} else if ('group' in req.query) {
				if (req.query.group === req.session.group) {
					db.get('users', null)
					.then(function(users) {
						var ary = users.map(function(v) {
							delete v.password;
							return v;
						});
						resp.json(ary);
					})
					.fail(function(err) {
						console.log('USERS: ', err);
						resp.json({error: {code: 0, message: 'failed to retreive users'}});
					});
				}
			}
		} else {
			resp.json({error: {code: 0, message: 'no valid session present'}});
		}
	},
	save: function(req, resp, next) {
		next();
	},
	update: function(req, resp, next) {
		if (req.session && 'name' in req.session && req.params.id === req.session.user_id) {
			delete req.body._id;
			delete req.body._rev;
			db.update('users', req.params.id, req.body)
			.then(function(doc) {
				delete doc.password;
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
		if (req.session && 'name' in req.session && req.params.id === req.session.user_id) {
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