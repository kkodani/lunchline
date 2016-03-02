// Controller for the main home list view
myApp.controller('listCtrl', function(distance, Data, $scope) {
  $scope.data = [];
  $scope.userLocation = {};

  // Function called when a wait time is reported.  Saves to session storage for refresh/back cases
  // and updates database.
  $scope.transferEvent = function(obj) {
    Data.clickedItem = obj;
    sessionStorage["tempStorage"] = JSON.stringify(obj);
  }

  // Order variable used for the sorting order
  $scope.order = function(predicate) {
    $scope.predicate = predicate;
    $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
  };

  // Main function on page load
  // Gets users geolocation, then pulls nearby places from database
  $scope.pullFromDatabase = function() {
    var geoOptions = {
      maximumAge: 60000,
      timeout: 30000
    };
    navigator.geolocation.getCurrentPosition(function(position) {
      $scope.userLocation = {
        lat: position.coords.latitude,
        long: position.coords.longitude
      };
      Data.getDatabase($scope.userLocation, function(fetchedData) {
        for(var i = 0; i < fetchedData.length; i++) {
          var destination = {
            long: fetchedData[i].restaurant.loc[0],
            lat: fetchedData[i].restaurant.loc[1]
          };
         fetchedData[i].restaurant.dist = distance.calc($scope.userLocation, destination);
        }
        $scope.data = fetchedData;
        $scope.contentLoading = false;
      });
    }, function(error){console.log(error);}, geoOptions);
  };

  // Calls Google API and adds nearby places not yet in database
  $scope.addToDatabase = function() {
    // Makes sure user location is available before calling
    if(Object.keys($scope.userLocation).length > 0){
      Data.addData($scope.userLocation);
    } else {
      setTimeout($scope.addToDatabase, 1000);
    }
  };

  // Call main post request
  $scope.pullFromDatabase();

  setTimeout($scope.addToDatabase, 100);

  // Sets default order to be ascending
  $scope.reverse = true;
  $scope.order('restaurant.dist');
  $scope.contentLoading = true;
});
