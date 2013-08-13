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
		.when('/products/edit/:id', {
				templateUrl: 'yo-admin-products-new-tpl',
				controller: 'yoAdminProductsEditCtrl'
			})
		.when('/orders', {
				templateUrl: 'yo-admin-orders-tpl',
				controller: 'yoAdminOrdersCtrl'
			});
});

YoAdminApp.controller('yoAdminMainCtrl', function($scope, $rootScope, service_stats) {
	var st;
	$rootScope.model = {};
	$rootScope.model.products = [];
	$rootScope.model.orders = [];
	$rootScope.model.stats = [];

	$('.nav-tabs').on('click', function(evt) {
		var nav = $(this).children();
		var p = $(evt.target).parent();
		if (!$(p).hasClass('active')) {
			nav.each(function(i, v) {
				if ($(v).hasClass('active')) $(v).removeClass('active');
			});
			$(p).addClass('active');
		}
	});

/*	st = service_stats.query({},
		function(s) {
			$rootScope.model.stats = s;
		},
		function(err) {
			console.log('failed to load stats');
		});
*/
});

YoAdminApp.controller('yoAdminProductsCtrl', function($scope, service_products) {
	var ps;
	ps = service_products.query({
		} ,function(p) {
			p.forEach(function(v) {
				var x;
				if (v.thumb && v.thumb.length) {
					x = v.thumb.split('/');
					v.thumb = x[x.length-1];
				}
			});
			$scope.model.products = p;
		} ,function() {
			console.log('failed to load products');
		});

	$scope.remove = function() {
		var self = this;
		$scope.model.products = $scope.model.products.filter(function(v) {
			return self.item._id !== v._id;
		});
		service_products.remove({id: self.item._id});
		delete self.item;
	}
});

YoAdminApp.controller('yoAdminProductsNewCtrl', function($scope, service_products) {
	$scope.sizes = [];

	$scope.add = function() {
		service_products.save({
			name: $scope.product.name,
			desc: $scope.product.desc,
			sizes: $scope.sizes,
			//default_width: $scope.product.default_width,
			//default_height: $scope.product.default_height,
			default_quantity: $scope.product.default_quantity,
			price: $scope.product.price || null,
			unit: $scope.product.unit,
			sku: $scope.product.sku,
			thumb: $scope.product.thumb,
		}, function(data) {
			console.log('RESP: ', data)
			$scope.product = {};
			$scope.sizes = [];
		});
	};

	$scope.cancel = function() {
		$scope.product = {};
		$scope.sizes = [];
		window.location.href = '#/products';
	}
});

YoAdminApp.controller('yoAdminProductsEditCtrl', function($scope, $routeParams, service_products) {
	if ('id' in $routeParams) {
		var x = $scope.model.products.filter(function(v) {
			return $routeParams.id === v._id
		});
		$scope.product = x[0];
		$scope.sizes = $scope.product.sizes;
	}

	$scope.add = function() {
		var body = {
			name: $scope.product.name,
			desc: $scope.product.desc,
			sizes: $scope.sizes,
//			default_width: $scope.product.default_width,
//			default_height: $scope.product.default_height,
			default_quantity: $scope.product.default_quantity,
			price: $scope.product.price || null,
			unit: $scope.product.unit,
			sku: $scope.product.sku,
			thumb: $scope.product.thumb,
		};

		service_products.save({id: $scope.product._id, body: body}, function(data) {
			console.log('RESP: ', data)
			$scope.product = {};
			$scope.sizes = [];
			window.location.href = '#/products';
		});
	};

	$scope.cancel = function() {
		$scope.product = {};
		$scope.sizes = [];
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


YoAdminApp.directive('yoAdminProductList', function() {
	return {
		restrict: 'A',
		templateUrl: 'yo-admin-products-items-tpl'
	}
});

/* list a summary of all orders */
YoAdminApp.directive('yoAdminOrdersSummary', function() {
	var linkFn = function(scope, el, attr) {
		var label = el.find('.label');
		if ('payment' in scope.order) {
			if (scope.order.payment.paid) {
				label.html('Paid');
				if (!label.hasClass('label-success')) label.addClass('label-success');
				label.removeClass('label-warning label-important');
			} else {
				label.html('Not Paid');
				if (!label.hasClass('label-warning')) label.addClass('label-warning');
				label.removeClass('label-success label-important');
			}
			if (scope.order.payment.failure_code) {
				label.html('Error');
				if (!label.hasClass('label-important')) label.addClass('label-important');
				label.removeClass('label-success label-warning');
				console.log('Payment error: ', scope.order.payment.failure_message);
			}
		} else {
			label.html('Not Paid');
			if (!label.hasClass('label-warning')) label.addClass('label-warning');
			label.removeClass('label-success label-important');
		}
	};

	return {
		restrict: 'A',
		controller: ['$scope', '$element', 'service_payments', 'service_orders',
		function($scope, $el, s_pay, s_order) {
			var div = $el.find('div.detail');

			$scope.formatDate = function(msg) {
				var m = moment(msg);
				return m.fromNow();
			};
			$scope.showDetail = function() {
				div.toggleClass('hidden');
			};
			$scope.captureCharge = function(id) {
				var label = $el.find('.label');
				var btn = $el.find('.btn');
				console.log(label)

				btn.attr('disabled', true);
				s_pay.save({id: id, body: {capture_charge: true}}, 
				function(d) {
					if ('id' in d) {
						console.log(d);
						s_order.get({id: d.id},
							function(doc) {
								console.log('new order doc: ', doc)
								var t = $scope.model.orders.map(function(v) {
									if (v._id === doc._id) return doc;
									else return v;
								});

								$scope.model.orders = t;
							},
							function(err) {
								console.log('failed to get updated order', err)
							});
					}
					console.log('catured successfully', d);
					label.html('Paid');
					if (!label.hasClass('label-success')) label.addClass('label-success');
					label.removeClass('label-warning label-important');
				},
				function(err) {
					label.html('Failed to charge card');
					if (!label.hasClass('label-important')) label.addClass('label-important');
					label.removeClass('label-success label-warning');
					console.log('failed to capture charges', err);
					btn.attr('disabled', false);
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
