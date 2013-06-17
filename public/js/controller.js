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
		console.log('adding: ', $scope);
		var x = $scope.item;
		x.quantity = $scope.new_quantity;
		x.total = $scope.total;
		service_basket.set(x);
		$scope.model.basket = service_basket.all();
	}

	$scope.remove = function(id) {
		console.log('removing: ', $scope.item);
		service_basket.remove($scope.item._id);
		$scope.model.basket = service_basket.all();
	}
});

/* contoller for handling interactions with product details */
YoApp.controller('yoBasketMenuCtrl', function($scope, service_basket) {
	console.log('BASKET: ', $scope)
	//$scope.model.basket = service_basket.all();
});

/* contoller for handling interactions with product details */
YoApp.controller('yoCheckoutCtrl', function($scope, service_basket) {

});

/*******************************************************************
* Directives
* All UI element directives
********************************************************************/
/* create product detail ui elements */
YoApp.directive('yoProductDetail', function() {
	var linkFn = function(scope, element, attrs) {
		console.log('link change')
		scope.new_quantity = scope.new_quantity || scope.item.default_quantity;

		scope.total = parseFloat(scope.item.price) * parseFloat(scope.new_quantity);

		$(element).find('.quantity').change(function() {
			scope.new_quantity = $(this).val()
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

/* create user top level menu items */
YoApp.directive('yoUserItems', function() {
	return {
		restrict: 'A',
		templateUrl: 'yo-user-items-tpl'
	}
});

/* list products as they are added to the shipping basket */
YoApp.directive('yoBasketItems', function() {
	var linkFn = function(s, e, a) {
		console.log(s);
	}

	return {
		restrict: 'A',
		link: linkFn,
		transclude: true,
		controller: 'yoBasketMenuCtrl',
		templateUrl: 'yo-basket-items-tpl'
	}
});

/* list products which are being checked out */
YoApp.directive('yoCheckoutItems', function() {
	return {
		restrict: 'A',
		templateUrl: 'yo-checkout-items-tpl'
	}
});

/*******************************************************************
* Filters
* 
********************************************************************/

