var YoApp = angular.module('YoApp', 
	['YoApp.services.Products'
	 , 'YoApp.services.Orders'
	 , 'ngSanitize'
	]);

YoApp.directive('yoProduct', function() {
	var linkFn = function(scope, element, attr) {

	}

	return {
		restrict: 'A',
		templateUrl: 'yo-product',
		link: linkFn
	};
});

YoApp.controller('yoProductCtrl', function($scope, service_products) {

});

YoApp.directive('yoProductDetail', function() {
	var linkFn = function(scope, element, attr) {

	}

	return {
		restrict: 'A',
		templateUrl: 'yo-product-detail',
		link: linkFn
	};
});

YoApp.controller('yoOrdersCtrl', function($scope, service_orders) {

});

//YoApp.directive('yoBasketDropdown')

//YoApp.directive('yoCheckout')