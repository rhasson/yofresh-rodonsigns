var YoAdminApp = angular.module('YoAdminApp', 
	['YoAdminApp.services.Products'
	 , 'YoAdminApp.services.Orders'
	 , 'YoAdminApp.services.Stats'
	 , 'YoAdminApp.services.Payments'
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
		//hide/show charge capture button
	};

	return {
		restrict: 'A',
		controller: ['$scope', '$element', 'service_payments', 'service_orders',
		function($scope, $el, s_pay, s_order) {
			$scope.formatDate = function(msg) {
				var m = moment(msg);
				return m.fromNow();
			};
			$scope.showDetail = function() {
				var div = $el.find('div.detail');
				div.toggleClass('hidden');
			};
			$scope.captureCharge = function(id) {
				var o;
				s_pay.save({id: id, body: {capture_charge: true}}, 
				function(d) {
					if ('id' in d) {
						o = s_order.get({id: d.id},
							function(doc) {
								console.log('new order doc: ', doc)
								var t = $scope.model.orders.map(function(v) {
									if (v._id === doc._id) return doc;
									else return v;
								});

								$scope.model.orders = t;
							},
							function(err) {
								console.log('failed to capture charges', err)
							});
					}
					console.log('catured successfully', d);
				},
				function(err) {
					console.log('failed to capture charges', err);
				});
			}
		}],
		templateUrl: 'yo-admin-orders-summary-items-tpl',
		link: linkFn
	}
});

YoAdminApp.directive('yoAdminOrderDesc', function() {
	return {
		restrict: 'A',
		templateUrl: 'yo-admin-order-desc-tpl'
	}
});
