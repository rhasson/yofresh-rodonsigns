/*******************************************************************
* Product service
* Returns ngResource to interface with product API
********************************************************************/
angular.module('YoAdminApp.services.Products', ['ngResource']).
	factory('service_products', ['$rootScope', '$resource', function(root, $resource) {
		return $resource('/api/v0/products/:id', {id: '@id'});
	}]);

/*******************************************************************
* Orders service
* Returns ngResource to interface with orders API
********************************************************************/
angular.module('YoAdminApp.services.Orders', ['ngResource'])
	.factory('service_orders', ['$rootScope', '$resource', function(root, $resource) {
		return $resource('/api/v0/orders/:id', {id: '@id'});
	}]);

/*******************************************************************
* Stats service
* Returns ngResource to interface with stats API
********************************************************************/
angular.module('YoAdminApp.services.Stats', ['ngResource'])
	.factory('service_stats', ['$rootScope', '$resource', function(root, $resource) {
		return $resource('/api/v0/stats/:id', {id: '@id'});
	}]);