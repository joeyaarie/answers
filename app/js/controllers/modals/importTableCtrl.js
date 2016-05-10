angular.module('answers.controllers')
  .controller('importTableCtrl', ['$scope', 'dataTable', '$mdDialog',
    function($scope, dataTable, $mdDialog) {

    $scope.newTable = {
      name:'',
      table: angular.copy(dataTable)
    };
    // Closes the modal
    $scope.cancel = function() {
      $mdDialog.hide(null);
    };
  }
]);
