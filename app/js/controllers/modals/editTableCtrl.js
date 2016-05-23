angular.module('answers.controllers')
  .controller('editTableCtrl', ['$scope', '$mdDialog','Toast', 'tableRow', 'tableIndex',
    function($scope, $mdDialog, Toast,tableRow, tableIndex) {

    var lookUp = angular.copy($scope.selectedLookUp);
    $scope.rowIndex = tableIndex;
    $scope.rowBeforeEditRow = lookUp.table[tableIndex - 1] || null;
    $scope.rowAfterEditRow  = lookUp.table[tableIndex + 1] || null;

    function convert(key) {
      return parseInt(tableRow[key]);
    };

    $scope.editTable = {
      A: convert('A'),
      B: convert('B'),
      C: convert('C'),
      D: convert('D')
    };

    // Closes the modal
    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.saveEditedRow = function(row) {
      lookUp.table[$scope.rowIndex] = _.extend(
        lookUp.table[$scope.rowIndex],
        row
      );
      var updatedLookUp = angular.copy(lookUp);
      $mdDialog.hide(updatedLookUp);
    };
  }
]);
