angular.module('answers.controllers')
.controller('TablesCtrl', ['$scope','Refs','Toast',
  function($scope, Refs, Toast) {

    Refs.patterns.on('value', function(snap) {
      $scope.allPatterns = _.toArray(snap.val());
      console.log($scope.allPatterns);
    });

    function delimit(pattern) {
      var insertPoint      = pattern.length - 1;
      var delimitedPattern = pattern.substring(0, insertPoint) + ',';
          delimitedPattern += pattern.substring(insertPoint, pattern.length);
      return delimitedPattern;
    }

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

  }
]);
