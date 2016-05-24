angular.module('answers.controllers')
.controller('TablesCtrl', ['$scope', 'Refs', 'Toast', 'MockData', '$timeout', '$mdDialog','$rootScope','Authentication',
  function($scope, Refs, Toast, MockData, $timeout, $mdDialog, $rootScope, Authentication) {

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
    var currentUserId;

    var saveToScope = function(name, snap) {
      $timeout(function() {
        $scope[name]  = _.toArray(
          keyUpArraysObjects(snap.val())
        );
      });
    };

    $rootScope.$watch('currentUser', function(user) {
      if (user) {
        currentUserId = user.uid;

        Refs.patterns.child(currentUserId).on('value', function(snap) {
          saveToScope('allPatterns', snap);
        });

        Refs.lookUps.child(currentUserId).on('value', function(snap) {
          saveToScope('allLookUpTables', snap);
        });

        Refs.sessions.child(currentUserId).on('value', function(snap) {
          saveToScope('allSessions', snap);
        });

      }
    });

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

    $scope.isTrailingOne = function(row, cell, index) {
      var trailingOne = cell === row[index + 1] || cell === row[index - 1];

      return trailingOne && parseInt(cell);
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
      } else {
        Toast('please load patterns');
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
      newPattern.userId =  currentUserId;
      $scope.addPattern = false;

      Refs.patterns.child(currentUserId).push(newPattern, function(error) {
        if (!error) {
          Toast("Successfully created new answers pattern");
          $scope.calculateOnePattern(newPattern);
        }
      });
    };

    var updateTable = function(data) {
      delete data.$$mdSelectId;
      Refs.lookUps.child(currentUserId).child(data.key).set(data, function() {
        Toast('look up has been updated.');
        recalculateCurrentTable();
      });
    };

    var recalculateCurrentTable = function() {alert('this was called');
      var sessions = extractCurrentPatterns();
      sessions.forEach(function(pattern) {
        $scope.calculateOnePattern(pattern);
      });
    };

    $scope.editThisLookUpTableRow = function(row, index) {
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        clickOutsideToClose: true,
        locals: {
          tableRow : row,
          tableIndex : index
        },
        controller: 'editTableCtrl',
        templateUrl: 'views/modals/edit-table-modal.html',
        targetEvent: event
      }).then(function(data) {
        $scope.selectedLookUp = data;
        updateTable(data);
      });
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
          Refs.patterns.child(currentUserId).child(pattern.key).remove();
          Toast("deleted successfully");
        }
      });

    };

    $scope.showEditPatternModal = function(item) {
      // TODO : should not be able to edit a pattern in use

      $mdDialog.show({
        locals: {
          pattern : item
        },
        controller: 'editPatternCtrl',
        templateUrl: 'views/modals/edit-pattern-modal.html',
        targetEvent: event
      }).then(function(data) {

        if (data)
          Refs.patterns.child(currentUserId).child(data.key).set(data, function() {
            Toast('pattern has been updated.')
          });

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

      Refs.lookUps.child(currentUserId).push(angular.copy(data), function(error) {
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
          Refs.lookUps.child(currentUserId).child(table.key).remove();
          Toast("deleted successfully");
        }
      });
    };

    var extractCurrentPatterns = function() {
      var resultsPatterns = [];
      $scope.resultsTable.forEach(function(Obj) {
        resultsPatterns.push({
          name: Obj.name,
          pattern: Obj.key,
          userId: currentUserId
        });
      });

      return resultsPatterns;
    };

    var saveSessionToDatabase = function(name) {
      Refs.sessions.child(currentUserId).push({
        name: name,
        created: Date.now(),
        userId: currentUserId,
        patterns: extractCurrentPatterns()
      }, function(error) {

        if (!error)
          Toast("Successfully created session");
      });
    };

    $scope.saveSession = function() {
      if (!$scope.resultsTable.length) {
        Toast('please ensure loaded patterns');
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

    $scope.exportTable = function() {
      var combinedTable = [];
      $scope.selectedLookUp.table.forEach(function(lookup, index) {
        var data = angular.copy(lookup);

        $scope.resultsTable.forEach(function(val, index2) {
          var nameKey   = val.name + ' (' + val.key + ')';
          data[nameKey] = val.data[index];
        });

        combinedTable.push(data);
      });

      MockData.jsonToCsv(
        combinedTable,
        $scope.selectedLookUp.name,
        true,
        function() {
          Toast('done exporting');
        });
    };

    $scope.deleteSession = function(session) {
      confirm.content('are you sure you want to delete session ?');
      confirm.targetEvent(event);
      $mdDialog.show(confirm).then(function(val) {
        if (val) {
          Refs.sessions.child(currentUserId).child(session.key).remove();
          Toast("deleted successfully");
        }
      });
    };

    $scope.loadSession = function(session) {
      if (!$scope.selectedLookUp) {
        Toast("Please select a look up before calculating");
        return;
      }

      $scope.resultsTable = [];
      session.patterns.forEach(function(pattern) {
        $scope.calculateOnePattern(pattern);
      });
    };

  }
]);
