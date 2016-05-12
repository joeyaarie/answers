angular.module('answers.controllers')
  .controller('editPatternCtrl', ['$scope', 'pattern', '$mdDialog',
    function($scope, pattern, $mdDialog) {

    $scope.editPattern =  angular.copy(pattern);
    // Closes the modal
    $scope.cancel = function() {
      $mdDialog.hide(null);
    };

    $scope.delimitPattern = function(pattern) {
      if (pattern.length > 0) {
        $scope.editPattern.pattern = pattern.toUpperCase();
      }
    };

    $scope.updatePattern = function(updatedPattern) {
      updatedPattern.pattern = updatedPattern.pattern.toUpperCase();
      $mdDialog.hide(updatedPattern);
    };
  }
]);
