angular.module('answers.controllers')
.controller('TablesCtrl', ['$scope','Refs','Toast','MockData',
  function($scope, Refs, Toast, MockData) {

    $scope.allPatterns = []; 
    $scope.newPattern  = {};
    $scope.resultsTable = [];

    $scope.tableData   = MockData.getResultsTable();
    $scope.lookUpTable = MockData.getLookUpTable();

    Refs.patterns.on('value', function(snap) {
      $scope.allPatterns  = _.toArray(keyUpArraysObjects(snap.val()));
    });

    // calculates the results of any pattern added.
    $scope.calculatePattern =  function(item) {
      $scope.resultsTable.push(
        MockData.computeResults(item, $scope.lookUpTable)
      );
    };

    function keyUpArraysObjects(array) {
      for(var prop in array) {
        if(!array[prop].key)
          array[prop].key = prop;
      }
      return array;
    };

    function getTableKeys(table) {
      return table.hasOwnProperty? {key: Object.keys(table), data: table} : table;
    };

    function combineResultAndAnswerTable() {
      if($scope.allPatterns.length) {
        $scope.allPatterns.forEach(function(pattern) {
          $scope.calculatePattern(pattern);
        });
      }
    };

    $scope.saveSession = function() {
      // save the session into the database 
      // so that its retrivable on another day 
      // save the session with the users desired name
    };

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
          $scope.calculatePattern(newPattern);
        }
      });

    };

    $scope.deleteItem = function(item) {
      Refs.patterns.child(item.key).remove();
    };

    $scope.editItem = function(item) {
    };

  }
]);
