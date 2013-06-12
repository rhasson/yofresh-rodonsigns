angular.module('YoApp.services.Products', ['ngResource']).
	factory('service_products', ['$rootScope', '$resource', function(root, $resource) {
		return $resource('/api/v0/products/:id', {id: '@id'});
	}]);

angular.module('YoApp.services.Orders', ['ngResource']).
	factory('service_orders', ['$rootScope', '$resource', function(root, $resource) {
		return $resource('/api/v0/orders/:id', {id: '@id'});
	}]);

angular.module('YoApp.services.Session', ['ngHttp']).
	factory('service_session', ['$rootScope', '$http', function(root, $http) {
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
			if (user.token) {
				this.token = user.token;
				this.user = user;
				this.loggedIn = true;
			}
		}

		Session.prototype.get = function() {
			return this.user;
		}

		return new Session();
	}]);
