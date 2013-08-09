/*******************************************************************
* Product service
* Returns ngResource to interface with product API
********************************************************************/
angular.module('YoApp.services.Products', ['ngResource'])
	.factory('service_products', ['$rootScope', '$resource', function(root, $resource) {
		return $resource('/api/v0/products/:id', {id: '@id'});
	}]);

/*******************************************************************
* Orders service
* Returns ngResource to interface with orders API
********************************************************************/
angular.module('YoApp.services.Orders', ['ngResource'])
	.factory('service_orders', ['$rootScope', '$resource', function(root, $resource) {
		return $resource('/api/v0/orders/:id', {id: '@id'});
	}]);

/*******************************************************************
* Accounts service
* Returns ngResource to interface with customer account API
********************************************************************/
angular.module('YoApp.services.Accounts', ['ngResource'])
	.factory('service_accounts', ['$rootScope', '$resource', function(root, $resource) {
		return $resource('/api/v0/users/:id', {id: '@id'});
	}]);

/*******************************************************************
* Application session service
* Returns a session class that manages the logged in user
********************************************************************/
angular.module('YoApp.services.Session', [])
	.factory('service_session', ['$rootScope', function(root) {
		function Session() {
			this.storage = lStorage();
		}
		
		Session.prototype.isLoggedin = function(){
			return this.storage.flag();
		}

		Session.prototype.logout = function() {
			this.storage.clear();
		}

		Session.prototype.set = function(user) {
			if (user._id) {
				this.storage.set(user);
			}
		}

		Session.prototype.get = function() {
			return this.storage.get();
		}

		function lStorage(name) {
			return new function() {
				this.name = name || 'yoSession';
				this.cache = {};

				this.set = function(user) {
					if (window.localStorage) window.localStorage.setItem(this.name, JSON.stringify(user));
					else this.cache[this.name] = JSON.stringify(user);
				}

				this.get = function() {
					var t, d;
					if (window.localStorage) t = window.localStorage.getItem(this.name);
					else t = this.cache[name]

					try {
						d = JSON.parse(t);
						return d;
					} catch(e) {
						return null;
					}
				}

				this.clear = function() {
					if (window.localStorage) window.localStorage.clear();
					else this.cache = {};
				}

				this.flag = function() {
					if (window.localStorage) return !!window.localStorage.key(this.name);
					else return !!Object.keys(this.cache).length;
				}
			}
		}

		return new Session();
	}]);

/*******************************************************************
* Shopping basket service
* Returns an API to interface with basket items
********************************************************************/
angular.module('YoApp.services.Basket', [])
	.factory('service_basket', ['$rootScope', function(root) {
		function Basket() {
			this._basket = [];
			this._subtotal = 0;
			this._tax = 0;
		}

		Basket.prototype.set = function(item) {
			var i; 
			if (i = this._basket[item._id]) {
				i.quantity += item.quantity;
				this._subtotal -= i.total;
				i.total = i.quantity * parseFloat(i.price);
			} else {
				i = item;
			}
			this._basket[i._id] = i;
			this._subtotal += i.total;
			return this;
		}

		Basket.prototype.get = function(id) {
			return this._basket[id];
		}

		Basket.prototype.all = function() {
			var b = [], self = this;

			Object.keys(self._basket).forEach(function(k) {
				b.push(self._basket[k]);
			});

			return b;
		}

		Basket.prototype.remove = function(id) {			
			this._subtotal -= this._basket[id].total
			return delete this._basket[id];
		}

		Basket.prototype.reset = function() {
			this._basket = [];
			this._subtotal = 0;
			this._tax = 0;
			return this;
		}

		Basket.prototype.tax = function() {
			if (root.model.user)
			this._tax = 0;
			return this._tax;
		}

		Basket.prototype.total = function() {

		}

		Basket.prototype.subtotal = function() {

		}

		return new Basket();
	}]);