angular.module('answers.controllers')
  .controller('renameCtrl', ['$scope', '$mdDialog','Toast',
    function($scope, $mdDialog, Toast) {

    // Closes the modal
    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.saveName = function(sessionName) {
      $mdDialog.hide($scope.sessionName);
    };
  }
]);
