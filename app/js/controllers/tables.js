angular.module('answers.controllers')
.controller('TablesCtrl', ['$scope','Refs','Toast','MockData','$timeout',
  function($scope, Refs, Toast, MockData, $timeout) {

    $scope.allPatterns  = []; 
    $scope.newPattern   = {};
    $scope.newLookUp    = {};
    $scope.resultsTable = [];
    $scope.addPattern     = false;
    $scope.edittingLookUp = false;
    $scope.showItemDetailEdit = false;
    $scope.activeTab = 'patterns-tab';

    $scope.tableData   = MockData.getResultsTable();
    $scope.lookUpTable = MockData.getLookUpTable();

    Refs.patterns.on('value', function(snap) {
      $timeout(function() {
        $scope.allPatterns  = _.toArray(keyUpArraysObjects(snap.val()));
      });
    });

    // calculates the results of any pattern added.
    $scope.calculatePattern =  function(item) {
      $scope.resultsTable.push(
        MockData.computeResults(item, $scope.lookUpTable)
      );
    };

    $scope.selectTab = function(tab) {
      $scope.activeTab = tab;
    };
    
    function keyUpArraysObjects(array) {
      for(var prop in array) {
        if(!array[prop].key)
          array[prop].key = prop;
      }
      return array;
    };

    $scope.openNewPatternTray = function() {
      $scope.newPattern = {};
      $scope.newLookUp  = {};
      $scope.addPattern     = !$scope.addPattern;
      $scope.edittingLookUp = false;
    };

    function combineResultAndAnswerTable() {
      if($scope.allPatterns.length) {
        $scope.resultsTable = [];
        $scope.allPatterns.forEach(function(pattern) {
          $scope.calculatePattern(pattern);
        });
      }
    };

    // create the options for export
    $scope.exportOptions = [
      { id: 1, name: 'Look Up' },
      { id: 2, name: 'Session' },
      { id: 3, name: 'Result Table' }
    ];
    $scope.selectedOption = $scope.exportOptions[0];

    $scope.removeFromResultsTable = function(index) {
     $scope.resultsTable.splice(index, 1);
    };

    $scope.saveSession = function() {
      // save the session into the database 
      // so that its retrivable on another day 
      // save the session with the users desired name
    };

    var isKeyPossible = function(pattern) {
      var key = pattern.length > 1? pattern.split().pop() : pattern;
      return _.contains(Object.keys($scope.lookUpTable[0]), key);
    };

    $scope.delimitPattern = function(pattern) {
      if(pattern.length > 0) {
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

    $scope.createLookUp = function(newLookUp) {
      if($scope.isLookUpInvalid(newLookUp)) {
        Toast('can not create lookup row, please check your values');
        return;
      }

      if(!$scope.edittingLookUp) {
        $scope.lookUpTable.push(newLookUp);
      }

      $scope.newLookUp = {};
      $scope.addPattern = false;
      combineResultAndAnswerTable();
    };

    $scope.editThisLookUpTableRow = function(row, index) {
      $scope.activeTab  = 'lookup-tab';
      $scope.addPattern = true;
      $scope.newLookUp  = $scope.lookUpTable[index];
      $scope.edittingLookUp = true;
      $scope.edittingLookUpIndex = index;
    };

    $scope.removeLookUpRow = function(lookup) {
      $scope.lookUpTable.splice($scope.edittingLookUpIndex,1);
      $scope.edittingLookUp = false;
      $scope.addPattern     = false;
      combineResultAndAnswerTable();
    };

    $scope.deletePattern = function(pattern) {
      Refs.patterns.child(pattern.key).remove();
    };

    $scope.saveItemEdit = function(pattern) {
      var unHasedPattern = angular.copy(pattern);
      unHasedPattern.pattern = unHasedPattern.pattern.toUpperCase();
      Refs.patterns.child(unHasedPattern.key).set(unHasedPattern, function() {
        Toast('Pattern has been updated');
      });
    };

    $scope.isLookUpInvalid = function(lookUp) { 
      var lookUpValues = _.values(lookUp);
      return _.contains(lookUpValues, "") || (lookUpValues.length < 4);
    };

  }
]);
