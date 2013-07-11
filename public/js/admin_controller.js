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

/* contoller for handling interactions with order details */
YoAdminApp.controller('yoAdminOrdersCtrl', function($scope, service_orders) {
	var ps;
	ps = service_orders.query({
		} ,function() {
			$scope.model.orders = ps;
		} ,function() {
			console.log('failed to load orders: ', ps)
	});
});

YoAdminApp.controller('yoAdminStatsCtrl', function($scope) {

});

YoAdminApp.directive('yoAdminProductList', function() {
	return {
		restrict: 'A',
		templateUrl: 'yo-admin-products-items-tpl'
	}
});

/* list a summary of all orders */
YoAdminApp.directive('yoAdminOrdersSummary', function() {
	var linkFn = function(scope, el, attr) {
		/*if (scope.order.status_code >= 0 && scope.order.status_code < 3) {
			el.removeAttr('class');
			el.addClass('ng-scope');
			el.addClass('warning');
		}
		if (scope.order.status_code >= 3 && scope.order.status_code <= 5) {
			el.removeAttr('class');
			el.addClass('ng-scope');
			el.addClass('success');
		}
		if (scope.order.status_code >= 6 && scope.order.status_code <= 9) {
			el.removeAttr('class');
			el.addClass('ng-scope');
			el.addClass('error');
		}*/
	};

	return {
		restrict: 'A',
		controller: ['$scope', '$element', function($scope, $el) {
			$scope.formatDate = function(msg) {
				var m = moment(msg);
				return m.fromNow();
			}
			$scope.orderDetail = function(id) {
				console.log('detail: ', id)
				var o = $scope.model.orders.filter(function(v) { return v._id === id; });
				var div = $el.find('div.detail');
				console.log(o, div, div.length);
				if (div.length === 0) {
					$el.append("<p data-yo-admin-order-details></p>");
					$el.children('div.detail').toggle('fast');
				}
				else div.toggle('fast');
			}
		}],
		templateUrl: 'yo-admin-orders-summary-items-tpl',
		link: linkFn
	}
});

/* component for showing order details */
YoAdminApp.directive('yoAdminOrderDetails', function() {
	return {
		restrict: 'A',
		replace: true,
		templateUrl: 'yo-admin-order-details-tpl'
	}
});

YoAdminApp.directive('yoAdminOrderDesc', function() {
	return {
		restrict: 'A',
		replace: true,
		templateUrl: 'yo-admin-order-desc-tpl'
	}
});
