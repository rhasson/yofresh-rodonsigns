var YoAdminApp = angular.module('YoAdminApp', 
	['YoAdminApp.services.Products'
	 , 'ngSanitize'
	]);

YoAdminApp.controller('yoAdminCtrl', function($scope, service_products) {
	$scope.add = function() {
		console.log($scope);

		service_products.save({
			name: $scope.product.name,
			desc: $scope.product.desc,
			code: $scope.product.code,
			default_width: $scope.product.default_width,
			default_height: $scope.product.default_height,
			default_quantity: $scope.product.default_quantity,
			price: $scope.product.price,
			unit: $scope.product.unit
		}, function(data) {
			console.log('RESP: ', data)
			$scope.product = {};
		});
	}
});