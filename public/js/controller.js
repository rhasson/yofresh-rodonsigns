var YoApp = angular.module('YoApp', 
	['YoApp.services.Products'
	 , 'YoApp.services.Orders'
	 , 'ngSanitize'
	]);

/* main product list controller */
YoApp.controller('yoProductCtrl', function($scope, service_products) {
	var ps = service_products.query({
		} ,function() {
			$('div.loading').remove();
			$scope.products = ps;
		} ,function() {
			$('div.loading').html('Failed to retrieve product');
		});
});

/* attach a data-yo-product-detail to each product to include its details */
YoApp.directive('yoProductDetail', function() {
	var linkFn = function(scope, element, attr) {

	}

	return {
		restrict: 'A',
		templateUrl: 'yo-product-detail-tpl',
		link: linkFn
	};
});

/* controller for each product item */
YoApp.controller('yoProductDetailCtrl', function($scope, service_products) {

});

YoApp.controller('yoOrdersCtrl', function($scope, service_orders) {

});

//YoApp.directive('yoBasketDropdown')

//YoApp.directive('yoCheckout')


//CryptoJS.MD5('this is a test').toString()