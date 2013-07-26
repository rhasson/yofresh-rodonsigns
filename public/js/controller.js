/*******************************************************************
* YoFresh Application
* v0.0.1
********************************************************************/
var YoApp = angular.module('YoApp', 
	['YoApp.services.Products'
	 , 'YoApp.services.Orders'
	 , 'YoApp.services.Session'
	 , 'YoApp.services.Basket'
	 , 'YoApp.services.Accounts'
	 , 'ngSanitize'
	]);

/*******************************************************************
* Application Configuration
*
********************************************************************/
YoApp.config(function($routeProvider, $locationProvider) {
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
		.when('/home/:page', {
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
			})
		.when('/account', {
				templateUrl: 'yo-accounts-tpl',
				controller: 'yoAccountsCtrl'
			})
		.when('/final', {
				templateUrl: 'yo-checkout-final-tpl',
				controller: 'yoCheckoutCtrl'
			})
		.otherwise({
			redirectTo: '/'
		});

	//$locationProvider.html5Mode(true);
});

/*******************************************************************
* Controllers
* All UI element controllers
********************************************************************/
/* controller for main application handling */
YoApp.controller('yoMainCtrl', function($scope, $rootScope, $routeParams, service_session, service_basket, service_products) {
	if (!service_session.isLoggedin()) window.location.href = '#/login';
	else {
		$rootScope.model = $rootScope.model || {};
		$rootScope.model.user = $rootScope.model.user || service_session.get();
		$rootScope.model.basket = service_basket.all() || [];
		$rootScope.model.products = $rootScope.model.products || getProducts();
		$rootScope.model.orders = $rootScope.model.orders || [];
	}

	function getProducts() {
		console.log('CALLING getProducts')
		var ps;
		if (service_session.isLoggedin()) {
			ps = service_products.query({
				} ,function(p) {
					$('div.loading').remove();
					$rootScope.model.products = p;
					$rootScope.model.page = p;
				} ,function() {
					$('div.loading').html('Failed to retrieve product');
			});
		}
	}
	if (!('page' in $routeParams)) $rootScope.model.page = $rootScope.model.products;
	else {
		$rootScope.model.page = $rootScope.model.products.filter(function(v) {
			return v.sku[0] === $routeParams.page;
		});
	}

	$rootScope.isAdmin = function() {
		if ($rootScope.model && $rootScope.model.user && $rootScope.model.user.group === 'admin') return true;
		else return false;
	}

	$rootScope.makeActive = function(group) {
		$('div.loading').remove();
		if ('page' in $routeParams) {
			if (group === $routeParams.page) return 'active';
			return '';
		} else return '';
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
					email: $('#iEmail').val().toLowerCase(),
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
					email: $('#iEmail').val().toLowerCase(),
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
						$('.message')
						  .html('Failed to register, please try again later.')
						  .fadeIn();
					}
				} else {
					service_session.set(body);
					window.location.href = '#/home';
				}
			})
			.fail(function(err) {
				service_session.logout();
			});
		} else { console.log('not registering') }
	}
});

/* product list controller to retreive all products from db */
YoApp.controller('yoProductCtrl', function($scope, $rootScope, service_session, service_products) {
/*	var ps;
	if (service_session.isLoggedin()) {
		ps = service_products.query({
			} ,function() {
				$('div.loading').remove();
				$scope.model.products = ps;
			} ,function() {
				$('div.loading').html('Failed to retrieve product');
		});
	}*/
});

/* contoller for handling interactions with product details */
YoApp.controller('yoProductDetailCtrl', function($scope, service_basket) {
	$scope.add = function() {
		var x = $scope.item;

		x.quantity = parseFloat($scope.new_quantity);
		x.total = parseFloat($scope.total);
		x.default_width = $scope.ssize ? $scope.ssize.w : 0;
		x.default_height = $scope.ssize ? $scope.ssize.h : 0;
		x.price = $scope.ssize ? $scope.ssize.price : x.price;
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
YoApp.controller('yoCheckoutCtrl', function($scope, service_session, service_basket, service_orders, service_accounts) {
	var ps;
	$('div.message').hide().removeClass('hide');

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

	if (service_session.isLoggedin() && ('model' in $scope)) {
		ps = service_accounts.get({id: $scope.model.user._id
			} ,function() {
				$scope.model.account = ps;
			} ,function() {
				console.log('failed to load account: ', ps)
		});
	}

	$scope.cancel = function() {
		service_basket.reset();
		window.location.href = '#/home';
	}

	$scope.saveStripeIdToDb = function(token) {
		//doing checkout
		var body = {
			subtotal: $scope.order.subtotal
			, shipping: $scope.order.shipping
			, items: service_basket.all()
			, stripe_token: token
		};

		service_orders.save(JSON.stringify(body)
			,function(data) {
				service_basket.reset();
				window.location.href = '#/home';
			}
			,function(err) {
				console.log('Orders API error: ', err);
				$('div.message').html("<p>Failed to place order, please contact RodonSigns at 215-885-5358</p>").show();
			});
	}
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
	}
});

/* contoller for handling customer account details */
YoApp.controller('yoAccountsCtrl', function($scope, service_accounts, service_session) {
	var ps;
	if (service_session.isLoggedin()) {
		ps = service_accounts.get({id: $scope.model.user._id
			} ,function() {
				$scope.model.account = ps;
			} ,function() {
				console.log('failed to load account: ', ps)
		});
	}

	$scope.formatDate = function(msg) {
		var m = moment(msg);
		return m.fromNow();
	}

	$scope.account_update = function() {
		$scope.model.account.id = $scope.model.account._id;
		$scope.model.account.$save(function(resp) {
			if ('error' in resp) {
				console.log('error saving account info: ', resp);
			} else {
				console.log('account info saved: ', resp);
			}
		});

	}

	$scope.account_cancel = function() {
		window.location.href = '#/home';
	}
});

/*******************************************************************
* Directives
* All UI element directives
********************************************************************/
/* create product detail ui elements */
YoApp.directive('yoProductDetail', function() {
	return {
		restrict: 'A',
		templateUrl: 'yo-product-detail-tpl',
		controller: 'yoProductDetailCtrl'
	}
});

/* create product detail ui elements */
YoApp.directive('yoProductDetailShort', function() {
	var linkFn = function(scope, element, attrs) {
		var b = scope.get(scope.item._id);
		var price;
		scope.ssize = scope.item.sizes[0];
		price = scope.ssize ? scope.ssize.price : scope.item.price;

		scope.new_quantity = parseFloat(scope.new_quantity) || parseFloat(scope.item.default_quantity);
		if (b) scope.new_quantity = b.quantity;

		scope.total = parseFloat(price) * parseFloat(scope.new_quantity);

		$(element).find('.quantity').change(function() {
			scope.new_quantity = parseFloat($(this).val());
			scope.total = parseFloat(price) * parseFloat(scope.new_quantity);
			//scope.$apply();
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
	var linkFn = function(scope, el, attr) {
		if (scope.order.status_code >= 0 && scope.order.status_code < 3) {
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
		}
	};

	return {
		restrict: 'A',
		controller: ['$scope', '$element', function($scope, $el) {
			$scope.formatDate = function(msg) {
				var m = moment(msg);
				return m.fromNow();
			}

			$scope.orderDetail = function() {
				console.log('ask for more detail', $scope, $el)
				//$($el).parent().append('<tr class="order_detail"></tr><td>Here is some more details.<ul>'+
				//	'<li>item 1</li><li>item 2</li><li>item 3</li></ul></td>').slideDown('fast');
			}
		}],
		templateUrl: 'yo-orders-summary-items-tpl',
		link: linkFn
	}
});

/* show user account summary */
YoApp.directive('yoAccountSummary', function() {
	return {
		restrict: 'A'
		//controller: 'yoAccountsCtrl'
		//templateUrl: 'yo-accounts-tpl'
	}
});

/* include stripe payment form */
YoApp.directive('yoStripeForm', function() {
	var linkFn = function(scope, el, attr) {
		$(el).on('click', function(evt) {
			var tokenCb = function(resp) {
				scope.saveStripeIdToDb(resp);
			}

			StripeCheckout.open({
			    key: 'pk_m4C7oD4vQQiBq6PO0ipmdNSUYVU1x'
			  , amount: parseFloat(scope.order.total) * 100
			  , name: 'YoFresh@RodonSigns'
			  , description: ''
			  , currency: 'usd'
			  , panelLabel: 'Checkout'
			  , address: false
			  , token: tokenCb
			});

			return false;
		});
	}

	return {
		restrict: 'A',
		controller: 'yoCheckoutCtrl',
		link: linkFn
	}
});

/*******************************************************************
* Filters
* 
********************************************************************/

