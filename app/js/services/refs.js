angular.module('answers.services')
  .factory('Refs', ['$cookies', '$firebase',
    function($cookies, $firebase) {
      var rootRef = new Firebase($cookies.rootRef || 'https://answers-table.firebaseio.com/');

      // define every standard ref used application wide
      return {
        root: rootRef,
        users: rootRef.child('users'),
        patterns: rootRef.child('patterns'),
        lookUps : rootRef.child('lookUps'),
        submissions: rootRef.child('submissions')
      };
    }
  ]);
