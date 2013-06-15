/*******************************************************************
* Product service
* Returns ngResource to interface with product API
********************************************************************/
angular.module('YoApp.services.Products', ['ngResource']).
	factory('service_products', ['$rootScope', '$resource', function(root, $resource) {
		return $resource('/api/v0/products/:id', {id: '@id'});
	}]);

/*******************************************************************
* Orders service
* Returns ngResource to interface with orders API
********************************************************************/
angular.module('YoApp.services.Orders', ['ngResource']).
	factory('service_orders', ['$rootScope', '$resource', function(root, $resource) {
		return $resource('/api/v0/orders/:id', {id: '@id'});
	}]);

/*******************************************************************
* Application Configuration
* Returns a session class that manages the logged in user
********************************************************************/
angular.module('YoApp.services.Session', []).
	factory('service_session', ['$rootScope', function(root) {
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
