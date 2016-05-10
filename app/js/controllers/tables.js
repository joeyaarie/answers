angular.module('answers.controllers')
.controller('TablesCtrl', ['$scope', 'Refs', 'Toast', 'MockData', '$timeout', '$mdDialog',
  function($scope, Refs, Toast, MockData, $timeout, $mdDialog) {

    $scope.allPatterns  = [];
    $scope.newPattern   = {};
    $scope.newLookUp    = {};
    $scope.resultsTable = [];
    $scope.addPattern     = false;
    $scope.edittingLookUp = false;
    $scope.showItemDetailEdit = false;
    $scope.allLookUpTables = [];
    $scope.selectedIndex = 0;

    $scope.initializeFileHandler = function() {
      var csvFileElement = angular.element(document.querySelector('#getCsvFile'));
      csvFileElement.on('change', loadCsvFile);
    };

    var loadCsvFile = function() {
      var file = document.querySelector('#getCsvFile').files[0];

      if (file) { console.log('found a file here');
        var reader = new FileReader();
        reader.readAsText(file);
      }

      reader.onload = function(event) {
        var textFile =  event.target.result;
        $scope.createLookUpfromJsonData(
          MockData.convertCsvToJsonData(textFile)
        );
      };

    };

    $scope.createLookUpfromJsonData = function(jsonArray) {
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        clickOutsideToClose: true,
        locals: {
          dataTable : jsonArray
        },
        controller: 'importTableCtrl',
        templateUrl: 'views/modals/import-table-modal.html',
        targetEvent: angular.element(document.querySelector('#getCsvFile'))
      }).then(function(data) {

        if (!data) {
          Toast("you canceled creation of table");
          return;
        }

        var newLookUp = {
          name : Date.now() + ' Look up',
          table : jsonArray
        };

        Refs.lookUps.push(newLookUp, function(error) {
          if (!error) {
            Toast("Successfully created look up patterm");
          }
        });
      });
      // show a big modal with the lookup table
      // ask for the table to be saved or discarded
      // put a section for the name of the table
      // save the table to the database and include
      // in the dropdown of the lookup tables

    };

    $scope.lookUpTable = MockData.getLookUpTable();

    Refs.patterns.on('value', function(snap) {
      $timeout(function() {
        $scope.allPatterns  = _.toArray(keyUpArraysObjects(snap.val()));
      });
    });

    Refs.lookUps.on('value', function(snap) {
      $timeout(function() {
        $scope.allLookUpTables  = _.toArray(keyUpArraysObjects(snap.val()));
      });
    });

    // calculates the results of any pattern added.
    $scope.calculatePattern =  function(newPattern) {
      if (!$scope.selectedLookUp) {
        Toast("Please select a look up before calculating");
        return;
      }
      var result = MockData.computeResults(
        newPattern,
        $scope.selectedLookUp.table
      );

      var isPresent = _.where($scope.resultsTable, result).length;
      if (isPresent) {
        Toast('You have added this to the table');
        return;
      }
      $scope.resultsTable.push(result);
    };

    $scope.selectTab = function(tab) {
      $scope.activeTab = tab;
    };

    function keyUpArraysObjects(array) {
      for(var prop in array) {
        if (!array[prop].key)
          array[prop].key = prop;
      }
      return array;
    };

    $scope.openNewPatternTray = function() {
      $scope.newPattern = {};
      $scope.newLookUp  = {};
      $scope.addPattern = !$scope.addPattern;
      $scope.edittingLookUp = false;
    };

    function combineResultAndAnswerTable() {
      if ($scope.allPatterns.length) {
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
      if (pattern.length > 0) {
        $scope.newPattern.pattern = pattern.toUpperCase();
      }
    };

    $scope.createPattern = function(newPattern) {
      newPattern.created = Date.now().valueOf();
      $scope.addPattern = false;

      Refs.patterns.push(newPattern, function(error) {
        if (!error) {
          Toast("Successfully created new answers pattern");
          $scope.calculatePattern(newPattern);
        }
      });
    };

    $scope.createLookUp = function(newLookUp) {
      if ($scope.isLookUpInvalid(newLookUp)) {
        Toast('can not create lookup row, please check your values');
        return;
      }

      if (!$scope.edittingLookUp) {
        $scope.selectedLookUp.table.push(newLookUp);
      }

      $scope.newLookUp = {};
      $scope.addPattern = false;
      combineResultAndAnswerTable();
    };

    $scope.editThisLookUpTableRow = function(row, index) {
      $scope.activeTab  = 'lookup-tab';
      $scope.addPattern = true;
      $scope.newLookUp  = $scope.selectedLookUp.table[index];
      $scope.edittingLookUp = true;
      $scope.edittingLookUpIndex = index;
    };

    $scope.removeLookUpRow = function(lookup) {
      $scope.selectedLookUp.table.splice($scope.edittingLookUpIndex,1);
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
        Toast('pattern has been updated.');
      });
    };

    $scope.showTheEditInput = function(index) {
      $scope.showItemDetailEdit = !$scope.showItemDetailEdit;
      $scope.editIndex = index;
    };

    $scope.isLookUpInvalid = function(lookUp) {
      var lookUpValues = _.values(lookUp);
      return _.contains(lookUpValues, "") || (lookUpValues.length < 4);
    };

    // push an empty look up and assign it as selected
    $scope.createLookUpTable = function() {
      var emptyLookUp = {
        name: Date.now() + '-Look up',
        table: [{
          A:0,
          B:0,
          C:0,
          D:0
        }]
      };

      $scope.allLookUpTables.unshift(emptyLookUp);
      $scope.selectedLookUp = $scope.allLookUpTables[0];
    };

  }
]);
