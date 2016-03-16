/* define our modules */
angular.module('answers.filters', []);
angular.module('answers.services', ['firebase','ngCookies']);
angular.module('answers.directives', []);
angular.module('answers.controllers', []);

/* load services */
require('./js/services/refs.js');
require('./js/services/toast.js');
require('./js/services/authentication.js');

/* load controllers */
require('./js/controllers/home.js');
require('./js/controllers/login.js');
require('./js/controllers/tables.js');

window.Answers = angular.module("Answers", [
  'ui.router',
  'answers.controllers',
  'answers.directives',
  'answers.filters',
  'answers.services',
  'ngAnimate',
  'ngMaterial'
]);

Answers.run(['$rootScope', '$state', 'Authentication', 'Refs','Toast',
  function($rootScope, $state, Authentication, Refs, Toast) {
  $rootScope._ = window._;
  $rootScope.moment = window.moment;
  $rootScope.authCallback = function(authData) {
    Authentication.auth(authData, function(user) {
      if(user) {
        //you can redirect a user here to the admin page by checking the service
        Toast('Welcome, ' + user.name + '!');
      }
      else {
        // logged out
        Authentication.logout();
        $state.go('login');
      }
    });
  };

  Refs.root.onAuth($rootScope.authCallback);
}]);

/* application routes */
Answers.config(['$stateProvider','$locationProvider',
 function($stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $stateProvider
    .state('login', {
      url: '/',
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl'
    })
    .state('logout', {
      url: '/logout',
      controller: ['Authentication', function(Authentication) {
        Authentication.logout();
      }]
    })
    .state('tables', {
      url: '/tables',
      templateUrl: 'views/tables.html',
      controller: 'TablesCtrl'
    })
    .state('default', {
      url: '/home',
      templateUrl: 'views/home.html',
      controller: 'HomeCtrl'
    });
}]);
