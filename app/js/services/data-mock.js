angular.module('answers.services')
  .factory('MockData', ['$mdToast', '$timeout', function($mdToast, $timeout){
    return {
      getResultsTable: function() {
        var results = [
          {
            'A':0,
            'B':1,
            'C':0,
            'D':0,
            'pat1':1,
            'pat2':1,
            'pat3':0,
            'pat4':0,
            'pat5':1
          },
          {
            'A':0,
            'B':1,
            'C':0,
            'D':0,
            'pat1':1,
            'pat2':1,
            'pat3':0,
            'pat4':0,
            'pat5':1
          },
          {
            'A':0,
            'B':1,
            'C':0,
            'D':0,
            'pat1':1,
            'pat2':1,
            'pat3':0,
            'pat4':0,
            'pat5':1
          },
          {
            'A':1,
            'B':1,
            'C':0,
            'D':1,
            'pat1':0,
            'pat2':1,
            'pat3':1,
            'pat4':0,
            'pat5':0
          },
          {
            'A':0,
            'B':1,
            'C':1,
            'D':1,
            'pat1':0,
            'pat2':0,
            'pat3':1,
            'pat4':1,
            'pat5':1
          }
        ];
        return results;
      },
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
      }
    };
  }]);
