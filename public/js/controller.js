/*******************************************************************
* YoFresh Application
* v0.0.1
********************************************************************/
var YoApp = angular.module('YoApp', 
	['YoApp.services.Products'
	 , 'YoApp.services.Orders'
	 , 'YoApp.services.Session'
	 , 'YoApp.services.Shipping'
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
		.when('/address', {
				templateUrl: 'yo-address-confirmation-tpl',
				controller: 'yoAccountsCtrl'
			})
		.when('/final', {
				templateUrl: 'yo-checkout-final-tpl',
				controller: 'yoFinalCheckoutCtrl'
			})
		.when('/orders', {
				templateUrl: 'yo-orders-tpl',
				controller: 'yoOrdersCtrl'
			})
		.when('/account', {
				templateUrl: 'yo-accounts-tpl',
				controller: 'yoAccountsCtrl'
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
YoApp.controller('yoMainCtrl', function($scope, $rootScope, $routeParams, service_accounts, service_session, service_basket, service_products) {
	if (!service_session.isLoggedin()) window.location.href = '#/login';
	else {
		$rootScope.model = $rootScope.model || {};
		$rootScope.model.user = $rootScope.model.user || service_session.get();
		$rootScope.model.basket = service_basket.all() || [];
		$rootScope.model.products = $rootScope.model.products || getProducts();
		$rootScope.model.orders = $rootScope.model.orders || [];
		$scope.model.account = $rootScope.model.account || service_accounts.get({id: $rootScope.model.user._id});
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
			return v.sku ? v.sku[0] === $routeParams.page : false;
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

/* contoller for handling interactions with product details */
YoApp.controller('yoProductDetailCtrl', function($scope, service_basket) {
	$scope.add = function() {
		var x = $scope.item;

		x.quantity = parseFloat($scope.new_quantity);
		x.price = $scope.ssize ? $scope.ssize.price : parseFloat(x.price);
		x.total = x.quantity * x.price;
		x.default_width = $scope.ssize ? 
			($scope.ssize.w ? $scope.ssize.w : 0) : 
				x.custom_size ?
					(x.custom_w ? x.custom_w : 0) : 0;
		x.default_height = $scope.ssize ? 
			($scope.ssize.h ? $scope.ssize.h : 0) :
				x.custom_size ? 
					(x.custom_h ? x.custom_h : 0) : 0;

		if (x.selected_flavors.length > 0) x.total = (x.price * x.selected_flavors.length) * x.quantity;
		else if (x.custom_size) x.total = x.quantity * (x.price * (x.default_height * x.default_width));
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

/* contoller for listing final order before completing purchase */
YoApp.controller('yoCheckoutCtrl', function($scope, service_basket) {
	//$('div.message').hide().removeClass('hide');

	$scope.cancel = function() {
    	service_basket.reset();
    	window.location.href = '#/home';
  	}

  	$scope.remove = function() {
  		service_basket.remove($scope.item._id);
  		$scope.model.basket = service_basket.all();
	}
});

/* contoller for handling final checkout */
YoApp.controller('yoFinalCheckoutCtrl', function($scope, service_basket, service_shipping, service_orders) {
	var ps;

	$scope.order = {
		total: 0
		, subtotal: 0
		, tax: 0
		, shipping: 0
	};

	var items = service_basket.all(true);  //true tells function to clean up selected_flavors

	$scope.order.subtotal = service_basket.subtotal();

	$scope.order.shipping = service_shipping.get($scope.order.subtotal);

	$scope.order.total = service_basket.total();

	$scope.order.tax = service_basket.tax();

	$scope.saveStripeIdToDb = function(token) {
	//doing checkout
		var body = {
		  subtotal: $scope.order.subtotal
		  , shipping: $scope.order.shipping
		  , tax: $scope.order.tax || 0
		  , items: items
		  , stripe_token: token
		};

		service_orders.save(JSON.stringify(body)
		  ,function(data) {
		  	if ('error' in data) {
				angular.element('div.message')
				  .html("<p>There was a problem with your card, please verify and try again</p>")
				  .removeClass('hide');
				console.log('Orders API error: ', data);
		  	} else {
		    	service_basket.reset();
		    	window.location.href = '#/home';
		  	}
		  }
		  ,function(err) {
		    console.log('Orders API error: ', err);
		    angular.element('div.message')
		      .html("<p>Failed to place order, please contact RodonSigns at 215-885-5358</p>")
		      .removeClass('hide');
		  });
	}

	$scope.getTax = function() {
		return service_basket.tax();
	}

	$scope.cancel = function() {
		service_basket.reset();
		window.location.href = '#/home';
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
	var msg = angular.element('div.message');

	if (!msg.hasClass('hide')) msg.addClass('hide');

	$scope.formatDate = function(msg) {
		var m = moment(msg);
		return m.fromNow();
	}

	$scope.account_update = function(next) {
		$scope.model.account.id = $scope.model.account._id;
		$scope.model.account.$save(function(resp) {
			if ('error' in resp) {
				console.log('error saving account info: ', resp);
				msg.html('<p>Failed to save account changes.  Please try again later.</p>')
				if (!msg.hasClass('alert-error')) msg.addClass('alert-error');
				if (msg.hasClass('alert-success')) msg.removeClass('alert-success');
				if (msg.hasClass('hide')) msg.removeClass('hide')
			} else {
				msg.html('<p>Changes saved successfully</p>')
				if (msg.hasClass('alert-error')) msg.removeClass('alert-error');
				if (!msg.hasClass('alert-success')) msg.addClass('alert-success');
				if (msg.hasClass('hide')) msg.removeClass('hide');
				console.log('account info saved: ', resp);
				window.location.href = '#/' + (next || 'home');
			}
		});
	}

	$scope.validate = function() {
		if (($scope.model.account.address.billing.street && $scope.model.account.address.billing.street.length) &&
			($scope.model.account.address.billing.state && $scope.model.account.address.billing.state.length) &&
			($scope.model.account.address.shipping.state && $scope.model.account.address.shipping.state.length) &&
			($scope.model.account.address.shipping.street && $scope.model.account.address.shipping.street.length)) {
			$scope.account_update('final');
		} else {
			msg.html('<p>Please fill in all required fields</p>')
			if (!msg.hasClass('alert-error')) msg.addClass('alert-error');
			if (msg.hasClass('alert-success')) msg.removeClass('alert-success');
			if (msg.hasClass('hide')) msg.removeClass('hide')
		}
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
YoApp.directive('yoProductDetailShort', function() {
	var linkFn = function(scope, element, attrs) {
		var b = scope.get(scope.item._id);
		var price;
		if ('code' in scope.item && scope.item.code >= 0) window.location.href = '#/logout'
		else {
			scope.ssize = scope.item.sizes[0];
			price = scope.ssize ? scope.ssize.price : parseFloat(scope.item.price);

			scope.new_quantity = scope.new_quantity || parseFloat(scope.item.default_quantity);
			if (b) scope.new_quantity = b.quantity;

			//scope.total = price * scope.new_quantity;
			//console.log('MAKING TOTAL: ', scope.total)

			$(element).find('.quantity').change(function() {
				scope.new_quantity = parseFloat($(this).val());
			//	scope.total = price * scope.new_quantity;
				//scope.$apply();
			});
		}
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
		if ('payment' in scope.order) {
			if (scope.order.payment.paid) {
				if (!el.hasClass('success')) el.addClass('success');
				el.removeClass('warning error');
				scope.order.status_message = 'Paid';
			} else if (scope.order.payment.failure_code) {
				if (!el.hasClass('error')) el.addClass('error');
				el.removeClass('warning success');
				scope.order.status_message = scope.order.payment.failure_message;
			} else {
				if (!el.hasClass('warning')) el.addClass('warning');
				el.removeClass('success error');
			}
		}
/*		if (scope.order.status_code >= 0 && scope.order.status_code < 3) {
			el.removeAttr('class');
			el.addClass('ng-scope warning');
		}
		if (scope.order.status_code >= 3 && scope.order.status_code <= 5) {
			el.removeAttr('class');
			el.addClass('ng-scope success');
		}
		if (scope.order.status_code >= 6 && scope.order.status_code <= 9) {
			el.removeAttr('class');
			el.addClass('ng-scope error');
		}
*/
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
			    key: 'pk_mt4iXpNq5hh7g51R2nnDBVqnT5CSY' //'pk_m4C7oD4vQQiBq6PO0ipmdNSUYVU1x'
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

YoApp.directive('yoShippingCheckbox', function() {
	var linkFn = function(scope, el, attr) {
		scope.$watch('iShipping', function(n, o) {
			scope.temp = scope.temp || scope.model.account.address.shipping;
			if (n === true && o === true) return;
			if (n) {
				angular.element('.shipping').addClass('hide');
				angular.element('#iShipping').attr('checked', true)
				scope.temp = scope.model.account.address.shipping;
				scope.model.account.address.shipping = scope.model.account.address.billing;
			} else {
				angular.element('.shipping').removeClass('hide');
				angular.element('#iShipping').attr('checked', false);
				scope.model.account.address.shipping = scope.temp;
			}
		});

		if ((scope.model.account.address.billing.street !== scope.model.account.address.shipping.street) ||
			  (scope.model.account.address.billing.city !== scope.model.account.address.shipping.city)) {
			scope.iShipping = false;
		} else scope.iShipping = true;
	}

	return {
		restrict: 'A',
		link: linkFn
	}
});

YoApp.directive('yoProductFlavors', function() {
	var linkFn = function(scope, el, attr) {
		var t;
		scope.item.selected_flavors = scope.item.selected_flavors || [];
		scope.flavors = [];
		if ('flavors' in scope.item && scope.item.flavors.length) {
			scope.item.flavors.split(',').forEach(function(v) {
				t = v.trim();
				if (t !== '') scope.flavors.push(t);
			});
		}
	}

	return {
		restrict: 'A',
		link: linkFn,
		templateUrl: 'yo-product-flavors-tpl'
	}
});

//TODO: save selected_flavors to db

YoApp.directive('yoProductFlavorsItems', function() {
	var linkFn = function(scope, el, attr) {
		var i = el.find('input');
		var f = clean(scope.flavor);
		i.attr('checked', scope.item.selected_flavors.indexOf(scope.flavor) >= 0 || false);
	}
	return {
		restrict: 'A',
		link: linkFn,
		controller: ['$scope', '$element', function($scope, $el) {
			$scope.check = function() {
				var f = $scope.item.selected_flavors.indexOf($scope.flavor);
				var i = $el.find('input');
				if (i.attr('checked')) {
					i.attr('checked', false);
					if (f >= 0) {
						$scope.item.selected_flavors.splice(f, 1);
					}
					//$scope.item.selected_flavors[f] = false;
				}
				else {
					i.attr('checked', true);
					//$scope.item.selected_flavors[f] = true;
					if (f === -1) {
						$scope.item.selected_flavors.push($scope.flavor);
					}
				}
			}
		}],
		templateUrl: 'yo-product-flavors-items-tpl'
	}
});

YoApp.directive('yoStateList', function() {
	return {
		restrict: 'A',
		scope: {
			state: '='
		},
		controller: ['$scope', '$element', function($scope, $el) {
			$scope.list = [
			    {abbriv: 'AL', name: 'Alabama'},
			    {abbriv: 'AK', name: 'Alaska'},
			    {abbriv: 'AZ', name: 'Arizona'},
			    {abbriv: 'AR', name: 'Arkansas'},
			    {abbriv: 'CA', name: 'California'},
			    {abbriv: 'CO', name: 'Colorado'},
			    {abbriv: 'CT', name: 'Connecticut'},
			    {abbriv: 'DE', name: 'Delaware'},
			    {abbriv: 'DC', name: 'District Of Columbia'},
			    {abbriv: 'FL', name: 'Florida'},
			    {abbriv: 'GA', name: 'Georgia'},
			    {abbriv: 'HI', name: 'Hawaii'},
			    {abbriv: 'ID', name: 'Idaho'},
			    {abbriv: 'IL', name: 'Illinois'},
			    {abbriv: 'IN', name: 'Indiana'},
			    {abbriv: 'IA', name: 'Iowa'},
			    {abbriv: 'KS', name: 'Kansas'},
			    {abbriv: 'KY', name: 'Kentucky'},
			    {abbriv: 'LA', name: 'Louisiana'},
			    {abbriv: 'ME', name: 'Maine'},
			    {abbriv: 'MD', name: 'Maryland'},
			    {abbriv: 'MA', name: 'Massachusetts'},
			    {abbriv: 'MI', name: 'Michigan'},
			    {abbriv: 'MN', name: 'Minnesota'},
			    {abbriv: 'MS', name: 'Mississippi'},
			    {abbriv: 'MO', name: 'Missouri'},
			    {abbriv: 'MT', name: 'Montana'},
			    {abbriv: 'NE', name: 'Nebraska'},
			    {abbriv: 'NV', name: 'Nevada'},
			    {abbriv: 'NH', name: 'New Hampshire'},
			    {abbriv: 'NJ', name: 'New Jersey'},
			    {abbriv: 'NM', name: 'New Mexico'},
			    {abbriv: 'NY', name: 'New York'},
			    {abbriv: 'NC', name: 'North Carolina'},
			    {abbriv: 'ND', name: 'North Dakota'},
			    {abbriv: 'OH', name: 'Ohio'},
			    {abbriv: 'OK', name: 'Oklahoma'},
			    {abbriv: 'OR', name: 'Oregon'},
			    {abbriv: 'PA', name: 'Pennsylvania'},
			    {abbriv: 'RI', name: 'Rhode Island'},
			    {abbriv: 'SC', name: 'South Carolina'},
			    {abbriv: 'SD', name: 'South Dakota'},
			    {abbriv: 'TN', name: 'Tennessee'},
			    {abbriv: 'TX', name: 'Texas'},
			    {abbriv: 'UT', name: 'Utah'},
			    {abbriv: 'VT', name: 'Vermont'},
			    {abbriv: 'VA', name: 'Virginia'},
			    {abbriv: 'WA', name: 'Washington'},
			    {abbriv: 'WV', name: 'West Virginia'},
			    {abbriv: 'WI', name: 'Wisconsin'},
			    {abbriv: 'WY', name: 'Wyomin'}
			]
		}],
		template: "<select name='states' ng-model='state' ng-options='l.abbriv as l.name for l in list' required> " +
				    "<option value='' selected='selected'> Select a State</option>"
	}
});
/*******************************************************************
* Filters
* 
********************************************************************/


/*******************************************************************
* Utilities
* 
********************************************************************/

function clean(txt) {
	return txt.toLowerCase().replace(/\W/ig, '');
}