angular.module('answers.controllers')
  .controller('createTableCtrl', ['$scope', '$mdDialog','Toast',
    function($scope, $mdDialog, Toast) {

    $scope.table = {};
    $scope.newTable = {
      table:[]
    };


    // Closes the modal
    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.saveNewTable = function(table) {
      $mdDialog.hide(table);
    };

    $scope.saveTableRow = function(row) {
      if (_.keys(row).length < 4) {
        Toast('incomplete row');
        return;
      }

      $scope.newTable.table.push(row);
      $scope.table = {};
    };
  }
]);
