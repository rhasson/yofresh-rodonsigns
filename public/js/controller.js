var YoApp = angular.module('YoApp', 
	['YoApp.services.Products'
	 , 'YoApp.services.Orders'
	 , 'ngSanitize'
	]);

YoApp.config(function($routeProvider) {
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
		.when('/home', {
				templateUrl: 'yo-home-tpl',
				controller: 'yoMainCtrl'
			})
		.when('/logout', {
				templateUrl: 'yo-logout-tpl',
				controller: 'yoLogoutCtrl'
			});
});

/* main product list controller */
YoApp.controller('yoProductCtrl', function($scope, $rootScope, service_products) {
	var ps;
	if ($rootScope.isLoggedin) {
		console.log('CALLING PRODUCT CTRL')
		ps = service_products.query({
			} ,function() {
				$('div.loading').remove();
				$scope.products = ps;
			} ,function() {
				$('div.loading').html('Failed to retrieve product');
		});
	}
});

/* product detail controller */
YoApp.controller('yoProductDetailCtrl', function($scope) {

});

/* controller for main application handling */
YoApp.controller('yoMainCtrl', function($scope, $rootScope) {
	if (!$rootScope.isLoggedin) window.location.href = '#/login';
});

/* controller for handling logout */
YoApp.controller('yoLogoutCtrl', function($scope, $rootScope) {
	$.get('/logout')
		.done(function(data) {
			if (data.status === 'ok'){
				$scope.isLoggedin = false;
				window.location.href = '#/';
			}
		})
});

/* controller for handling user logins */
YoApp.controller('yoLoginCtrl', function($scope, $rootScope) {
	if ($rootScope.isLoggedin) window.location.href = '#/home';
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
					$scope.user = user;
					$rootScope.isLoggedin = true;
					window.location.href = '#/home';
				} else {
					$rootScope.isLoggedin = false;
					$('.message')
					  .html(user.error.message)
					  .fadeIn();
				}
			})
			.fail(function(err) {
				console.log('login attempt failed');
				$rootScope.isLoggedin = false;
			});
		} else {
			$('.message')
			  .html('Please fill in the missing information!')
			  .fadeIn();
		}
	}
});

/* controller for handling user registration */
YoApp.controller('yoRegisterCtrl', function($scope, $rootScope) {
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
						$scope.user = body;
						$rootScope.isLoggedin = true;
						window.location.href = '#/home';
					}
				}
			})
			.fail(function(err) {
				$rootScope.isLoggedin = false;
			});
		} else { console.log('not registering') }
	}
});

YoApp.directive('yoProductDetail', function() {
	return {
		restrict: 'A',
		templateUrl: 'yo-product-detail-tpl',
		controller: 'yoProductDetailCtrl'
	}
});