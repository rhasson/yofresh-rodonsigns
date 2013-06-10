var Users = require('./users')
 	, Products = require('./products')
 	, Orders = require('./orders')
 	, db = require('db')
 	, crypto = require('crypto')
 	, kue = require('kue')
 	, jobs = kue.createQueue();


module.exports = exports = {
	base: {
		login: function(req, resp, next) {
			db.auth(req.params.email, req.body.password)
			.then(function(auth) {
				req.session.id = auth.id;
				req.session.name = {first: auth.firstname, last: auth.lastname};
				req.session.email = auth.email;
				resp.render('home', {name: req.session.name, email: req.session.email});
			})
			.fail(function(err) {
				resp.json({error: {code: 0, message: 'login failed'}});
			});
		},
		logout: function(req, resp, next) {
			req.session = null;
			resp.redirect('/');
		},
		register: function(req, resp, next) {
			if (req.session) {
				db.save('user', '', {
					firstname: req.body.firstname,
					lastname: req.body.lastname,
					email: req.body.email,
					password: req.body.password  //b64 decode then hash before saving
				})
				.then(function(doc) {
					jobs.add('new user', {id: doc._id}).priority('high').save();
					
					db.auth(req.params.email, req.body.password)
					.then(function(auth) {
						req.session.id = auth.id;
						req.session.name = {first: auth.firstname, last: auth.lastname};
						req.session.email = auth.email;
						resp.render('home', {name: req.session.name, email: req.session.email});
					})
					.fail(function(err) {
						resp.json({error: {code: 0, message: 'login failed'}});
					});
				})
				.fail(function(err) {
					resp.render('error', {message: 'registration failed'});
				});

			}
		},
		index: function(req, resp, next) {
			if (req.session && req.session.user_id) {
				resp.render('home', {user: req.session.username});
			} else {
				resp.render('register', {layout: false});
			}
		}
	},
	api: {
		v0: {
			products: Products, 
			users: Users,
			orders: Orders
		}
	}
}