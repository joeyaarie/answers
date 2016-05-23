/* define our modules */
angular.module('answers.filters', []);
angular.module('answers.services', ['firebase','ngCookies']);
angular.module('answers.directives', []);
angular.module('answers.controllers', []);

/* load services */
require('./js/services/refs.js');
require('./js/services/toast.js');
require('./js/services/authentication.js');
require('./js/services/data-mock.js');

/* load controllers */
require('./js/controllers/home.js');
require('./js/controllers/login.js');
require('./js/controllers/tables.js');

/* load the modal controllers*/
require('./js/controllers/modals/importTableCtrl.js');
require('./js/controllers/modals/createTableCtrl.js');
require('./js/controllers/modals/editTableCtrl.js');
require('./js/controllers/modals/editPatternCtrl.js');
require('./js/controllers/modals/renameCtrl.js');

/* load directives */
require('./js/directives/logout.js');

window.Answers = angular.module("Answers", [
  'ui.router',
  'answers.controllers',
  'answers.directives',
  'answers.filters',
  'answers.services',
  'ngAnimate',
  'ngMaterial',
  '720kb.tooltips'
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
        $rootScope.currentUser = user;
      }
      else {
        // logged out
        $state.go('logout');
      }
    });
  };

  Refs.root.onAuth($rootScope.authCallback);
  // $rootScope.$on('$stateChangeStart',
  //   function(event, toState, toParams, fromState, fromParams, options) {
  //     var states = ['/tables','/login'];
  //     if(_.contains(states, toState.url) && !$rootScope.currentUser) {
  //       Refs.root.onAuth($rootScope.authCallback);
  //     }
  // });

}]);

/* application routes */
Answers.config(['$stateProvider','$locationProvider','$mdThemingProvider',
 function($stateProvider, $locationProvider, $mdThemingProvider) {

  $locationProvider.html5Mode(true);
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl'
    })
    .state('logout', {
      url: '/logout',
      controller: ['Authentication', function(Authentication) {
        Authentication.logout();
      }]
    })
    .state('default', {
      url: '/tables',
      templateUrl: 'views/tables.html',
      controller: 'TablesCtrl'
    });

  $mdThemingProvider.theme('default')
    .primaryPalette('blue-grey')
    .accentPalette('amber');

}]);
