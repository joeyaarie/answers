angular.module('answers.services')
  .factory('Data', [function($mdToast){
    return {
      resultsTable: function() {
        var results = [
        {
          'A':0,
          'B':1,
          'C':0,
          'D':0
        },
        {

        }
        ];
      }
    };
  }]);
