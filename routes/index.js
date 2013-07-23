var Users = require('./users')
 	, Products = require('./products')
 	, Orders = require('./orders')
 	, Payments = require('./payments')
 	, db = require('../lib/db')
 	, crypto = require('crypto')
 	, kue = require('kue')
 	, jobs = kue.createQueue();


module.exports = exports = {
	base: {
		login: function(req, resp, next) {
			console.log(req.body)
			db.auth(req.body.email, req.body.password)
			.then(function(auth) {
				req.session.user_id = auth._id;
				req.session.name = {first: auth.firstname, last: auth.lastname};
				req.session.email = auth.email;
				req.session.group = auth.group;
				//resp.render('home', {name: req.session.name, email: req.session.email});
				resp.json(auth);
			})
			.fail(function(err) {
				resp.json({error: {code: 2, message: 'login failed'}});
			});
		},
		logout: function(req, resp, next) {
			req.session.destroy();
			resp.json({status: 'ok'});
		},
		register: function(req, resp, next) {
			if (req.session) {
				console.log('BODY: ', req.body);
				db.save('users', '', {
					firstname: req.body.firstname,
					lastname: req.body.lastname,
					email: req.body.email,
					password: req.body.password,
					group: 'nobody'
				})
				.then(function(doc) {
					var p;
					p = jobs.create('registration confirmation', {
						user_id: doc._id,
						name: req.body.firstname,
						email: req.body.email
					});
					p.on('failed', function(e) {
						console.log('capture payment job failed: ', e);
					};
					p.on('complete', function() {
						console.log('sent registration confirmation');
					});
					p.save();
					
					db.auth(req.body.email, req.body.password)
					.then(function(auth) {
						req.session.user_id = auth._id;
						req.session.name = {first: auth.firstname, last: auth.lastname};
						req.session.email = auth.email;
						req.session.group = auth.group;

						resp.json({status: 'ok'});
					})
					.fail(function(err) {
						console.log(err)
						resp.json({error: {code: 2, message: err.message || 'login failed'}});
					});
				})
				.fail(function(err) {
					resp.json({error: {code: 1, message: err.message || 'registration failed'}});
				});
			}
		},
		index: function(req, resp, next) {
			if (req.session && 'name' in req.session) {
				//resp.render('home', {user: req.session.name});
				resp.render('home');
			} else {
				resp.render('home'); //, {laytou:false});
			}
		},
		admin: function(req, resp, next) {
			console.log(req.session)
			if (req.session) {
				if (req.session.group === 'admin') resp.render('admin');
				else resp.render('home');
			}
		}
	},
	api: {
		v0: {
			products: Products, 
			users: Users,
			orders: Orders,
			payments: Payments
		}
	}
}