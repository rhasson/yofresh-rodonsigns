angular.module('YoApp.services.Products', ['ngResource']).
	factory('service_products', ['$rootScope', '$resource', function(root, $resource) {
		return $resource('/api/v0/products/:id', {id: '@id'});
	}]);

angular.module('YoApp.services.Orders', []).
	factory('service_orders', ['$rootScope', '$resource', function(root, $resource) {
		return $resource('/api/v0/orders/:id', {id: '@id'});
	}]);
