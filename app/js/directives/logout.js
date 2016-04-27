angular.module('answers.directives')
  .directive('logout', [function () {
    return {
      restrict: 'A',
      replace: 'true',
      controller: ['$scope', '$state', 'Authentication',
        function($scope, $state, Authentication) {
        $scope.logout = function() {
          Authentication.logout();
          $state.go('login');
        };
      }]
    }
  }]);