/*******************************************************************
* YoFresh Application
* v0.0.1
********************************************************************/
var YoApp = angular.module('YoApp', 
	['YoApp.services.Products'
	 , 'YoApp.services.Orders'
	 , 'YoApp.services.Session'
	 , 'YoApp.services.Basket'
	 , 'ngSanitize'
	]);

/*******************************************************************
* Application Configuration
*
********************************************************************/
YoApp.config(function($routeProvider) {
/* Page router configuration */
	$routeProvider
		.when('/', {
				templateUrl: 'yo-login-form-tpl',
				controller: 'yoLoginCtrl'
			})
		.when('/login', {
				templateUrl: 'yo-login-form-tpl',
				controller: 'yoLoginCtrl'
			})
		.when('/register', {
				templateUrl: 'yo-register-form-tpl',
				controller: 'yoRegisterCtrl'
			})
		.when('/logout', {
				templateUrl: 'yo-logout-tpl',
				controller: 'yoLogoutCtrl'
			})
		.when('/home', {
				templateUrl: 'yo-home-tpl',
				controller: 'yoMainCtrl'
			})
		.when('/checkout', {
				templateUrl: 'yo-checkout-tpl',
				controller: 'yoCheckoutCtrl'
			})
		.when('/orders', {
				templateUrl: 'yo-orders-tpl',
				controller: 'yoOrdersCtrl'
			});
});

/*******************************************************************
* Controllers
* All UI element controllers
********************************************************************/
/* controller for main application handling */
YoApp.controller('yoMainCtrl', function($scope, $rootScope, service_session, service_basket) {
	if (!service_session.isLoggedin()) window.location.href = '#/login';
	else {
		$rootScope.model = $rootScope.model || {};
		$rootScope.model.user = $rootScope.model.user || service_session.get();
		$rootScope.model.basket = service_basket.all() || [];
		$rootScope.model.products = $rootScope.model.products || [];
		$rootScope.model.orders = $rootScope.model.orders || [];

		$('ul.nav').children().each(function(i,a){$(a).show()});
		//$('i.icon-user').parent().append(' '+$scope.model.user.firstname);
		//$('i.icon-basket-1').parent().append(' Basket');
	}
});

/* controller for handling logout */
YoApp.controller('yoLogoutCtrl', function($scope, $rootScope, service_session, service_basket) {
	$.get('/logout')
		.done(function(data) {
			if (data.status === 'ok'){
				service_session.logout();
				service_basket.reset();
				$rootScope.model = {};
				$('ul.nav').children().each(function(i,a){$(a).hide()})
				window.location.href = '#/';
			}
		})
});

/* controller for handling user logins */
YoApp.controller('yoLoginCtrl', function($scope, service_session) {
	if (service_session.isLoggedin()) window.location.href = '#/home';
	$scope.login = function() {
		if ($scope.email && $scope.email !== '' && $scope.password && $scope.password !== '') {
			$('.message')
			  .fadeOut();
			$.post('/login', {
					email: $('#iEmail').val(),
					password: CryptoJS.MD5($('#iPassword').val()).toString()
				}
			)
			.done(function(user) {
				if (user && !('error' in user)) {
					service_session.set(user);
					window.location.href = '#/home';
				} else {
					service_session.logout();
					$('.message')
					  .html(user.error.message)
					  .fadeIn();
				}
			})
			.fail(function(err) {
				console.log('login attempt failed');
				service_session.logout();
			});
		} else {
			$('.message')
			  .html('Please fill in the missing information!')
			  .fadeIn();
		}
	}
});

/* controller for handling user registration */
YoApp.controller('yoRegisterCtrl', function($scope, service_session) {
	$scope.register = function() {
		if ($scope.email && $scope.email !== '' && $scope.password && $scope.password !== '') {
			$('.message')
			  .fadeOut();
			$.post('/register', {
					email: $('#iEmail').val(),
					firstname: $('#iFirstname').val(),
					lastname: $('#iLastname').val(),
					password: CryptoJS.MD5($('#iPassword').val()).toString()
				}
			)
			.done(function(body) {
				if ('error' in body) {
					if (body.error.code === 1) {
						$('.message')
						  .html('Email is already in use!')
						  .fadeIn();
					} else {
						service_session.set(body);
						window.location.href = '#/home';
					}
				}
			})
			.fail(function(err) {
				service_session.logout();
			});
		} else { console.log('not registering') }
	}
});

/* product list controller to retreive all products from db */
YoApp.controller('yoProductCtrl', function($scope, service_session, service_products) {
	var ps;
	if (service_session.isLoggedin()) {
		ps = service_products.query({
			} ,function() {
				$('div.loading').remove();
				$scope.model.products = ps;
			} ,function() {
				$('div.loading').html('Failed to retrieve product');
		});
	}
});

/* contoller for handling interactions with product details */
YoApp.controller('yoProductDetailCtrl', function($scope, service_basket) {
	$scope.add = function() {
		var x = $scope.item;
		x.quantity = parseFloat($scope.new_quantity);
		x.total = parseFloat($scope.total);
		service_basket.set(x);
		$scope.model.basket = service_basket.all();
	}

	$scope.remove = function(id) {
		service_basket.remove($scope.item._id);
		$scope.model.basket = service_basket.all();
	}

	$scope.get = function(id) {
		return service_basket.get(id);
	}
});

/* contoller for handling interactions with product details */
YoApp.controller('yoBasketMenuCtrl', function($scope, service_basket) {
	console.log('BASKET: ', $scope)
	//$scope.model.basket = service_basket.all();
});

/* contoller for handling interactions with product details */
YoApp.controller('yoCheckoutCtrl', function($scope, service_basket, service_orders) {
	$scope.order = {
		total: 0
	    , subtotal: 0
		, shipping: 25
	};

	var items = service_basket.all();

	items.forEach(function(v) {
		$scope.order.subtotal += v.total;
	});

	if (items.length) $scope.order.total = $scope.order.subtotal + $scope.order.shipping;
	else $scope.order.shipping = 0;

	$scope.cancel = function() {
		service_basket.reset();
		window.location.href = '#/home';
	}

	$scope.checkout = function() {
		//doing checkout
		var body = {
			subtotal: $scope.order.subtotal
			, shipping: $scope.order.shipping
			, items: service_basket.all()
		};

		service_orders.save(JSON.stringify(body)
			,function(data) {
				console.log('Orders API: ', data);
			}
			,function(err) {
				console.log('Orders API error: ', err);
			});
	}

	$scope.goback = function() {
		window.location.href = '#/home';
	}

	console.log('checkout: ', $scope)
});

/* contoller for handling interactions with product details */
YoApp.controller('yoOrdersCtrl', function($scope, service_orders, service_session) {
		var ps;
		if (service_session.isLoggedin()) {
		ps = service_orders.query({
			} ,function() {
				$scope.model.orders = ps;
			} ,function() {
				console.log('failed to load orders: ', ps)
		});

		$scope.status = function() {
			//get more detail
		}

		$scope.cancel = function() {
			//cancel order
		}

		$scope.formatDate = function(msg) {
			var m = moment(msg);
			return m.fromNow()
		}
}

/*******************************************************************
* Directives
* All UI element directives
********************************************************************/
/* create product detail ui elements */
YoApp.directive('yoProductDetail', function() {
	var linkFn = function(scope, element, attrs) {
		var b = scope.get(scope.item._id);
		scope.new_quantity = parseFloat(scope.new_quantity) || parseFloat(scope.item.default_quantity);
		if (b) scope.new_quantity = b.quantity;

		scope.total = parseFloat(scope.item.price) * parseFloat(scope.new_quantity);

		$(element).find('.quantity').change(function() {
			scope.new_quantity = parseFloat($(this).val());
			scope.total = parseFloat(scope.item.price) * parseFloat(scope.new_quantity);
			scope.$apply();
		});
	}

	return {
		restrict: 'A',
		link: linkFn,
		templateUrl: 'yo-product-detail-tpl',
		controller: 'yoProductDetailCtrl'
	}
});

/* create product detail ui elements */
YoApp.directive('yoProductDetailShort', function() {
	var linkFn = function(scope, element, attrs) {
		var b = scope.get(scope.item._id);
		scope.new_quantity = parseFloat(scope.new_quantity) || parseFloat(scope.item.default_quantity);
		if (b) scope.new_quantity = b.quantity;

		scope.total = parseFloat(scope.item.price) * parseFloat(scope.new_quantity);

		$(element).find('.quantity').change(function() {
			scope.new_quantity = parseFloat($(this).val());
			scope.total = parseFloat(scope.item.price) * parseFloat(scope.new_quantity);
			scope.$apply();
		});
	}

	return {
		restrict: 'A',
		link: linkFn,
		templateUrl: 'yo-product-detail-short-tpl',
		controller: 'yoProductDetailCtrl'
	}
});

/* create user top level menu items */
YoApp.directive('yoUserItems', function() {
	return {
		restrict: 'A',
		templateUrl: 'yo-user-items-tpl'
	}
});

/* list products as they are added to the shipping basket */
YoApp.directive('yoBasketItems', function() {
	return {
		restrict: 'A',
		controller: 'yoBasketMenuCtrl',
		templateUrl: 'yo-basket-items-tpl'
	}
});

/* list products which are being checked out */
YoApp.directive('yoCheckoutItems', function() {
	return {
		restrict: 'A',
		controller: 'yoCheckoutCtrl',
		templateUrl: 'yo-checkout-items-table-tpl'
	}
});

/* list a summary of all orders */
YoApp.directive('yoOrdersSummary', function() {
	return {
		restrict: 'A',
		controller: 'yoOrdersCtrl',
		templateUrl: 'yo-orders-summary-items-tpl'
	}
});

/*******************************************************************
* Filters
* 
********************************************************************/

