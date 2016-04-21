angular.module('answers.controllers')
.controller('TablesCtrl', ['$scope','Refs','Toast',
  function($scope, Refs, Toast) {

    Refs.patterns.on('value', function(snap) {
      $scope.allPatterns = _.toArray(snap.val());
    });

    $scope.newPattern = {};
    $scope.delimitPattern = function(pattern) {
      if(pattern.length > 1) {
        $scope.newPattern.pattern = pattern.toUpperCase();
      }
    };

    $scope.createPattern = function(newPattern) {
      newPattern.created = Date.now().valueOf();
      $scope.addPattern = false;
      Refs.patterns.push(newPattern, function(error) {
        if(!error) {
          Toast("Successfully created new answers pattern");
        }
      });
    };

    $scope.deleteItem = function(item) {
      console.log('delete item : ',item);
    };

    $scope.editItem = function(item) {
      console.log('edit item : ',item);
    };

  }
]);
