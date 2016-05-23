angular.module('answers.services')
  .factory('MockData', ['$mdToast', '$timeout', function($mdToast, $timeout){
    return {
      getLookUpTable: function() {
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

          i = (i === answerPatternArray.length - 1)? 0 : i + 1;

        }

        var resultData = {
          key: patternName,
          name: data.name,
          data: calculatedPattern
        };

        return resultData;
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
      },

      jsonToCsv: function(data, filename, showColumnName, cb) {

        var arrData = data;
        var csvFile = filename + '\r\n\n';

        if (showColumnName) {
          var row = "";
          for(var index in arrData[0]) {
            row += index + ',';
          }
          row = row.slice(0, -1);
          csvFile += row + '\r\n';
        }

        for(var i = 0; i < arrData.length; i++) {
          var row = "";
          for(var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
          }
          row.slice(0, row.length - 1);
          csvFile += row + '\r\n';
        }

        if(csvFile == '') {
          Toast("Something broke Invalid data",true);
          return;
        }

        // Generate a file name and download
        var docName = "";
        docName += filename.replace(/ /g,"_");
        var uri = 'data:text/csv;charset=utf-8,' + escape(csvFile);
        var link = document.createElement("a");
        link.href = uri;
        link.style = "visibility:hidden";
        link.download = docName + ".csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        cb(csvFile, filename);
      }
    };
  }]);
