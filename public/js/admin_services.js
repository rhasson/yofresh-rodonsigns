/*******************************************************************
* Product service
* Returns ngResource to interface with product API
********************************************************************/
angular.module('YoAdminApp.services.Products', ['ngResource']).
	factory('service_products', ['$rootScope', '$resource', function(root, $resource) {
		return $resource('/api/v0/products/:id', {id: '@id'});
	}]);