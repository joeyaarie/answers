angular.module('answers.controllers')
  .controller('createTableCtrl', ['$scope', '$mdDialog',
    function($scope, $mdDialog) {

    console.log('table', $scope);
    $scope.newTable = {
      table:[]
    };

    $scope.table = {};
    // Closes the modal
    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.saveNewTable = function(table) {
      $mdDialog.hide(table);
    };

    $scope.saveTableRow = function(row) {
      $scope.newTable.table.push(row);
      $scope.table = {};
    };

    $scope.isRowComplete = function(table) {
      return  _.keys(table).length < 4;
    };
  }
]);
