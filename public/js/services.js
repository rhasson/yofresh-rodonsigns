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
* Application Configuration
* Returns a session class that manages the logged in user
********************************************************************/
angular.module('YoApp.services.Session', [])
	.factory('service_session', ['$rootScope', function(root) {
		function Session() {
			this.user = {};
			this.token = '';
			this.loggedIn = false;
		}
		
		Session.prototype.isLoggedin = function(){
			return this.loggedIn;
		}

		Session.prototype.logout = function() {
			this.user = {};
			this.token = ''
			this.loggedIn = false;
		}

		Session.prototype.set = function(user) {
			if (user._id) {
				this.token = user._id;
				this.user = user;
				this.loggedIn = true;
			}
		}

		Session.prototype.get = function() {
			return this.user;
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
		}

		Basket.prototype.set = function(item) {
			var i; 
			if (i = this._basket[item._id]) {
				i.quantity += item.quantity;
				i.total = i.quantity * parseFloat(i.price);
			} else {
				i = item;
			}
			this._basket[i._id] = i;
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
			return delete this._basket[id];
		}

		Basket.prototype.reset = function() {
			this._basket = [];
			return this;
		}

		return new Basket();
	}]);