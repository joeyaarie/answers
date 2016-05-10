angular.module('answers.services')
  .factory('MockData', ['$mdToast', '$timeout', function($mdToast, $timeout){
    return {
      getLookUpTable: function() {
        var lookUp = [
          {
            'A':0,
            'B':1,
            'C':0,
            'D':0
          },
          {
            'A':0,
            'B':1,
            'C':0,
            'D':0
          },
          {
            'A':0,
            'B':1,
            'C':0,
            'D':0
          },
          {
            'A':1,
            'B':1,
            'C':0,
            'D':1
          },
          {
            'A':0,
            'B':1,
            'C':1,
            'D':1
          }
        ];
        return lookUp;
      },
      computeResults: function(data, lookUpTable) {
        var answerPattern = data.pattern;

        if(answerPattern.length < 1) {
          alert("please enter the answer pattern");
          return;
        }

        if(lookUpTable.length < 1) {
          alert("you have not loaded an answer sheet")
          return;
        }

        var calculatedPattern = {},
            patternName = answerPattern.toUpperCase(),
            answerPatternArray = patternName.split(""),
            i = 0,
            j = 0;

        for(j; j < lookUpTable.length; j++) {

          var value = lookUpTable[j][answerPatternArray[i]];
          var condition = angular.isUndefined(value);
          calculatedPattern[j] = condition? 'N' : value;

          if(i === answerPatternArray.length - 1) {
            i = 0;
          }
          else i++;
        }

        var resultData = {
          key: patternName,
          name: data.name,
          data: calculatedPattern
        };
        // resultData[patternName] = calculatedPattern;

        // this return is used to return just the calculated pattern
        // this should be commented out in case this is not used.
        return resultData;

        // $timeout(function() {
        //   $scope.allResults.push(resultData);
        //   console.log('all results here to see',$scope.allResults);
        // });
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
      },
      convertCsvToJsonData: function(csvFile) {
        var lines = this.csvToArray(csvFile),
            result = [],
            headers=lines[0];

        for(var i=1; i<lines.length; i++) {

          obj = {},
          currentline=lines[i];

          for(var j=0; j<headers.length; j++) {
            obj[headers[j]] = currentline[j];
          }

          result.push(obj);
        }

        return result;
      }
    };
  }]);
