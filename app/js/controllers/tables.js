angular.module('answers.controllers')
.controller('TablesCtrl', ['$scope', 'Refs', 'Toast', 'MockData', '$timeout', '$mdDialog',
  function($scope, Refs, Toast, MockData, $timeout, $mdDialog) {

    $scope.allPatterns  = [];
    $scope.allSessions  = [];
    $scope.newPattern   = {};
    $scope.newLookUp    = {};
    $scope.resultsTable = [];
    $scope.addPattern     = false;
    $scope.edittingLookUp = false;
    $scope.showItemDetailEdit = false;
    $scope.allLookUpTables = [];
    $scope.selectedIndex = 0;

    var confirm = $mdDialog.confirm()
      .title('Delete Confirmation')
      .content('Are you sure you want to delete this?')
      .ok('OK')
      .cancel('Cancel')
      .targetEvent();

    $scope.initializeFileHandler = function() {
      var csvFileElement = angular.element(
        document.querySelector('#getCsvFile')
      );

      csvFileElement.on('change', loadCsvFile);
    };

    var loadCsvFile = function(e) {
      var file = e.currentTarget.files[0];
      $(this).val(''); // clear the file input for another input

      if (file) {
        var reader = new FileReader();
        reader.readAsText(file);
      }

      reader.onload = function(event) {
        var textFile =  event.target.result;
        $scope.createLookUpfromJsonData(
          MockData.convertCsvToJsonData(textFile),
          event
        );
      };

    };

    $scope.createLookUpfromJsonData = function(jsonArray, event) {
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        clickOutsideToClose: true,
        locals: { dataTable : jsonArray },
        controller: 'importTableCtrl',
        templateUrl: 'views/modals/import-table-modal.html',
        targetEvent: event
      }).then(function(data) {
        saveCreatedTable(data);
      });
    };

    $scope.lookUpTable = MockData.getLookUpTable();

    var saveToScope = function(name, snap) {
      $timeout(function() {
        $scope[name]  = _.toArray(
          keyUpArraysObjects(snap.val())
        );
      });
    };

    Refs.patterns.on('value', function(snap) {
      saveToScope('allPatterns', snap);
    });

    Refs.lookUps.on('value', function(snap) {
      saveToScope('allLookUpTables', snap);
    });

    Refs.sessions.on('value', function(snap) {
      saveToScope('allSessions', snap);
    });

    // calculate all the pattern that is available
    $scope.calculateAllPatterns = function() {
      combineResultAndAnswerTable();
    };

    // calculates the results of any pattern added.
    $scope.calculateOnePattern =  function(newPattern) {
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
          $scope.calculateOnePattern(pattern);
        });
      }
    };

    $scope.removeFromResultsTable = function(index) {
     $scope.resultsTable.splice(index, 1);
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
          $scope.calculateOnePattern(newPattern);
        }
      });
    };

    $scope.editThisLookUpTableRow = function(row, index) {
      $scope.activeTab  = 'lookup-tab';
      $scope.addPattern = true;
      $scope.newLookUp  = $scope.selectedLookUp.table[index];
      $scope.edittingLookUpIndex = index;
      $scope.edittingLookUp = true;
    };

    $scope.removeLookUpRow = function(lookup) {
      $scope.selectedLookUp.table.splice($scope.edittingLookUpIndex, 1);
      $scope.edittingLookUp = false;
      $scope.addPattern     = false;
      combineResultAndAnswerTable();
    };

    $scope.deletePattern = function(pattern) {
      confirm.content('are you sure you want to delete this pattern?');
      confirm.targetEvent(event);
      $mdDialog.show(confirm).then(function(val) {
        if (val) {
          Refs.patterns.child(pattern.key).remove();
          Toast("deleted successfully");
        }
      });

    };

    $scope.showEditPatternModal = function(item) {
      $mdDialog.show({
        locals: {
          pattern : item
        },
        controller: 'editPatternCtrl',
        templateUrl: 'views/modals/edit-pattern-modal.html',
        targetEvent: event
      }).then(function(data) {

        if (data) {
          Refs.patterns.child(data.key).set(data, function() {
            Toast('pattern has been updated.')
          });
        }

      });
    };

    $scope.isLookUpInvalid = function(lookUp) {
      var lookUpValues = _.values(lookUp);
      return _.contains(lookUpValues, "") || (lookUpValues.length < 4);
    };

    var saveCreatedTable = function(data) {
      if (!data) {
        Toast("you canceled creation of table");
        return;
      }

      Refs.lookUps.push(angular.copy(data), function(error) {
        if (!error) {
          Toast("Successfully created look up table");
        }
      });
    };

    // push an empty look up and assign it as selected
    $scope.createNewTable = function() {
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        controller: 'createTableCtrl',
        templateUrl: 'views/modals/create-table-modal.html',
        targetEvent: event
      }).then(function(data) {
        saveCreatedTable(data);
      });
    };

    // delete the selected look up table
    $scope.deleteLookUp = function(table) {
      confirm.content('are you sure you want to delete look up ?');
      confirm.targetEvent(event);
      $mdDialog.show(confirm).then(function(val) {
        if (val) {
          Refs.lookUps.child(table.key).remove();
          Toast("deleted successfully");
        }
      });
    };

    var saveSessionToDatabase = function(name) {
      var sessionLookUp = angular.copy($scope.selectedLookUp);
      delete sessionLookUp.$$mdSelectId;

      Refs.sessions.push({
        name: name,
        created: Date.now(),
        lookUp: sessionLookUp,
        patterns: angular.copy($scope.resultsTable)
      }, function(error) {

        if (!error)
          Toast("Successfully created session");

      });
    };

    $scope.saveSession = function() {
      if (!$scope.resultsTable.length || !$scope.selectedLookUp) {
        Toast('please ensure a look up and patterns');
        return;
      }

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        controller: 'renameCtrl',
        templateUrl: 'views/modals/name-modal.html',
        targetEvent: event
      }).then(function(name) {
        saveSessionToDatabase(name);
      });
    };

    $scope.deleteSession = function(session) {
      confirm.content('are you sure you want to delete session ?');
      confirm.targetEvent(event);
      $mdDialog.show(confirm).then(function(val) {
        if (val) {
          Refs.sessions.child(session.key).remove();
          Toast("deleted successfully");
        }
      });
    };

  }
]);
