/*
* DB abstraction for the storing and loading favorites
* v.0.0.2
*/

var cradle = require('cradle')
	, Q = require('q')
	, crypto = require('crypto')
	, config = require('../config.js').config;

function DB () {
	cradle.setup({
        host: process.env.NODE_ENV === 'production' ? config.db.host : 'http://127.0.0.1',
        port: process.env.NODE_ENV === 'production' ? config.db.port : 5984,
        auth: process.env.NODE_ENV === 'production' ? config.db.auth : '',
        cache: false,
        raw: false
	});
	this._cradle = new(cradle.Connection);
	this._db = this._cradle.database('yofresh');
}

module.exports = new DB();

/*
* authenticates user based on email and password
* @email: user's email address
* @password: supplied password, hashed and base64 encoded
* @return user document
*/
DB.prototype.auth = function(email, password) {
	var def = Q.defer()
		, self = this
		, pass = calc(password);

	Q.ninvoke(self._db, 'view', 'users/by_email', {key: email})
	.then(function(doc) {
		if (pass === doc[0].value.password) {
			delete doc[0].value.password;
			def.resolve(doc[0].value);
		} else {
			def.reject(new Error('email or password did not match'));
		}
	})
	.fail(function(err) {
		def.reject(new Error(err));
	});

	return def.promise;
}

/*
* Gets a particular record based on document id
* @type: type of record to return
* @id: document id
* return: json object with the requested items
*/
DB.prototype.get = function(type, id) {
	var def = Q.defer()
		, self = this
		, view = type+'/all';

	if (id) {
		Q.ninvoke(self._db, 'get', id)
		.then(function(doc) {
			if (type === doc.type) def.resolve(doc);
			else def.reject(new Error('document type mismatch'))
		})
		.fail(function(err) {
			def.reject(new Error(err));
		});
	} else {
		Q.ninvoke(self._db, 'view', view)
		.then(function(docs) {
			var a = docs.map(function(v) {
				return v;
			});
			def.resolve(a);
		})
		.fail(function(err) {
			def.reject(new Error(err));
		});
	}
	return def.promise;
}

/*
* Gets records by their id
* @user_id: user id to get tweets for
* @params:
*  - start_id: id to start from
*  - end_id: the last id to get up to
*  - count: total number of records to get if end_id is not present
*  - sort: sort direction.  desc or asc
*/
DB.prototype.get_orders_by_userid = function(user_id, params) {
	var self = this
		, couch_obj = {}
		, def = Q.defer()
		, view = 'orders/by_user_id';

	params = params || {};
	params.sort = params.sort || 'desc';

	if (params.count) couch_obj.limit = params.count;

	Q.ninvoke(self._db, 'view', view, couch_obj)
	.then(function(resp){
		var ary = resp.map(function(v) {
			return v;
		});
		return def.resolve(ary);
	})
	.fail(function(err) {
		return def.reject(new Error(err));
	});

	return def.promise;
}

/*
* Save favorites to redis and couch
* @type: type of record to save
* @user_id: the user id for which to save
* @items: an array of objects to save
*/
DB.prototype.save = function(type, user_id, item) {
	var self = this
	  , def = Q.defer();

	if (type === 'users') {
		Q.ninvoke(self._db, 'view', 'users/by_email', {key: item.email})
		.then(function(doc) {
			if (doc.length) def.reject(new Error('Email address already in use'));
			else {
				item.password = calc(item.password);
				save();
			}
		})
		.fail(function(err) {
			def.reject(new Error(err));
		})
	} else {
		if (type !== 'user') item.user_id = user_id;
		save();
	}
	function save() {
		item.type = type;
		item.created_at = new Date().toJSON();
		item.modified_at = item.created_at;

		Q.ninvoke(self._db, 'save', item)
		.then(function(doc) {
			if (doc.ok) def.resolve({_id: doc.id, _rev: doc.rev});
			else def.reject(new Error(doc));
		})
		.fail(function(err) {
			def.reject(new Error(err));
		});
	}

	return def.promise;
}

/*
* update item in db
* @type: document type
* @id: the user id for which to save
* @item: an objects to update
*/
DB.prototype.update = function(type, id, item) {
	var self = this
	  , def = Q.defer();

	if ('password' in item) item.password = calc(item.password);

	self.get(type, id)
	.then(function(doc) {
		if (doc.type === type) util._extend(doc, item);
		else def.reject(new Error('document type mismatch'));
		doc.modified_at = new Date().toJSON();
		Q.ninvoke(self._db, 'save', doc._id, doc._rev, doc)
		.then(function(ids) {
			def.resolve(doc);
		})
		.fail(function(err) {
			def.reject(new Error(err));
		});
	})
	.fail(function(err) {
		def.reject(new Error(err));
	});

	return def.promise;
}

/*
* deletes a favorite from db
* @id: the document id to delete
*/
DB.prototype.del = function(id) {
	var self = this
	  , def = Q.defer();		

	Q.ninvoke(self._db, 'get', id)
	.then(function(doc) {
		Q.ninvoke(self._db, 'remove', doc._id, doc._rev)
		.then(function(doc) {
			if (doc.ok) def.resolve({_id: doc.id, _rev: doc.rev});
			else def.reject(new Error(doc));
		})
		.fail(function(err) {
			return def.reject(new Error(err));
		});
	})
	.fail(function(err) {
		return def.reject(new Error(err));
	})

	return def.promise;
}

/*
* returns the total number of favorites in couchdb
* @user_id: the user id to count
*/
DB.prototype.count = function(type, user_id) {
	var def = Q.defer();

	Q.ninvoke(this._db, 'view', type+'/count', {key: user_id})
	.then(function(resp) {
		var count = resp.length ? resp[0].value : 0;
		return def.resolve(count);
	})
	.fail(function(err) {
		return def.reject(new Error(err));
	});

	return def.promise;
}

calc = function(password) {
	var salt = 'a2fc409ae3223d3b5dedd2dddd6bc58f'
		, s
		, newpass = '';

	newpass = password + salt;

	s = crypto.createHash('md5');
	s.update(newpass);

	return s.digest('hex');
}