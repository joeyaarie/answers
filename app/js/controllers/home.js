angular.module('answers.controllers')
  .controller('HomeCtrl', ['$scope','$timeout', function($scope, $timeout) {

  // var ref = new Firebase("https://docs-examples.firebaseio.com/web/saving-data/fireblog");
  console.log('got to the home controller');

  $scope.initializeFileHandler = function() {
    var csvFileElement = angular.element(document.querySelector('#getCsvFile'));
    csvFileElement.on('change',answers.loadCsvFile);
    $scope.patterns = [];
    $scope.allResults = [];
  };

  $scope.addAnswerPattern = function() {
    var newPattern = {
      pattern:"",
      patternIndex: $scope.patterns.length
    };

    $scope.patterns.push(newPattern);
  };

  $scope.removeAnswerPattern = function() {
    $scope.patterns.pop();
  };

  $scope.computeTable = function(data) {
    answers.computeTable(data);
  };

  var answers = {
    initialize: function() {
      var original;
      $("#getCsvFile").on('change',answers.loadCsvFile);
    },

    saveToLocalStorage: function(data) {

      if(localStorage) {
        localStorage.setItem('json_original', JSON.stringify(data));
      }

      // answers.populateDataTable(data.data);
      original = data.data;

    },

    loadCsvFile: function() {
      var file = document.querySelector('#getCsvFile').files[0];

      if(file) {
        var reader = new FileReader();
        reader.readAsText(file);
      }

      reader.onload = function(event) {
        var textFile =  event.target.result;
        answers.convertCsvToJsonData(textFile);
      };

    },

    computeTable: function(data) {
      var answerPattern = data.pattern;

      if(answerPattern.length < 1) {
        alert("please enter the answer array separated by comma ','");
        return;
      }

      if(original.length < 1) {
        alert("you have not loaded an answer sheet")
        return;
      }

      var answerPatterArray = answerPattern.toUpperCase().split(",");
      var patternName = answerPatterArray.join();
      var calculatedPattern = {};
      var i = 0;

      for(var j = 0; j < original.length; j++) {
        calculatedPattern[j] = original[j][answerPatterArray[i]];
        if(i === answerPatterArray.length - 1) {
          i = 0;
        }
        else i++;
      }

      var resultData = {};
      resultData[patternName] = calculatedPattern;
      $timeout(function() {
        $scope.allResults.push(resultData);
        console.log('all results here to see',$scope.allResults);
      });
    },

    convertCsvToJsonData: function(csvFile) {
      var lines = answers.csvToArray(csvFile),
          result = [],
          headers=lines[0];

      for(var i=1; i<lines.length; i++) {

        obj = {},
        currentline=lines[i];

        for(var j=0;j<headers.length;j++){
          obj[headers[j]] = currentline[j];
        }

        result.push(obj);
      }

      var latestJson = {
        time: new Date(),
        data: result
      }

      answers.saveToLocalStorage(latestJson);
    },

    csvToArray: function(strData) {
      var strDelimiter = ",",
          objPattern = new RegExp((
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            "([^\"\\" + strDelimiter + "\\r\\n]*))"),
           "gi");

      var arrData = [[]];
      var arrMatches = null;

      while (arrMatches = objPattern.exec(strData)) {
        var strMatchedDelimiter = arrMatches[1];

        if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
          arrData.push([]);
        }

        if (arrMatches[2]) {
          var strMatchedValue = arrMatches[2].replace(
          new RegExp("\"\"", "g"), "\"");
        } else {
          var strMatchedValue = arrMatches[3];
        }

        arrData[arrData.length - 1].push(strMatchedValue);
      }
      return (arrData);
    }
  }
}]);
