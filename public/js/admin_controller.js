var YoAdminApp = angular.module('YoAdminApp', 
	['YoAdminApp.services.Products'
	 , 'YoAdminApp.services.Orders'
	 , 'YoAdminApp.services.Stats'
	 , 'ngSanitize'
	]);

/*******************************************************************
* Application Configuration
*
********************************************************************/
YoAdminApp.config(function($routeProvider, $locationProvider) {
/* Page router configuration */
	$routeProvider
		.when('/', {
				templateUrl: 'yo-admin-home-tpl',
				controller: 'yoAdminMainCtrl'
			})
		.when('/logout', {
				templateUrl: 'yo-logout-tpl',
				controller: 'yoLogoutCtrl'
			})
		.when('/home', {
				templateUrl: 'yo-admin-home-tpl',
				controller: 'yoAdminMainCtrl'
			})
		.when('/products', {
				templateUrl: 'yo-admin-products-tpl',
				controller: 'yoAdminProductsCtrl'
			})
		.when('/products/new', {
				templateUrl: 'yo-admin-products-new-tpl',
				controller: 'yoAdminProductsNewCtrl'
			})
		.when('/orders', {
				templateUrl: 'yo-admin-orders-tpl',
				controller: 'yoAdminOrdersCtrl'
			})
		.when('/stats', {
				templateUrl: 'yo-admin-stats-tpl',
				controller: 'yoAdminStatsCtrl'
			});
});

YoAdminApp.controller('yoAdminMainCtrl', function($scope, $rootScope) {
	$rootScope.model = {};
	$rootScope.model.products = {};
	$rootScope.model.orders = {};

	$('.nav-tabs').on('click', function(evt) {
		var nav = $(this).children();
		var p = $(evt.target).parent();
		if (!$(p).hasClass('active')) {
			nav.each(function(i, v) {
				if ($(v).hasClass('active')) $(v).removeClass('active');
			});
			$(p).addClass('active');
		}
	})
});

YoAdminApp.controller('yoAdminProductsCtrl', function($scope, service_products) {
	var ps;
	ps = service_products.query({
		} ,function() {
			$scope.model.products = ps;
		} ,function() {
			console.log('failed to load products');
	});

	$scope.remove = function(id) {

	}

	$scope.update = function(id) {

	}
});

YoAdminApp.controller('yoAdminProductsNewCtrl', function($scope, service_products) {
	$scope.add = function() {
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
	};

	$scope.cancel = function() {
		$scope.product = {};
		window.location.href = '#/products';
	}
});

YoAdminApp.controller('yoAdminOrdersCtrl', function($scope, service_orders) {

});

YoAdminApp.controller('yoAdminStatsCtrl', function($scope) {

});

YoAdminApp.directive('yoAdminProductList', function() {
	return {
		restrict: 'A',
		templateUrl: 'yo-admin-products-items-tpl'
	}
});
