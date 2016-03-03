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
  // Gets users geolocation, gets data from database, filters data for view
  $scope.pullFromDatabase = function() {
    var geoOptions = {
      maximumAge: 60000,
      timeout: 30000
    };
    navigator.geolocation.getCurrentPosition(function(position) {
      console.log("received geolocation");
      $scope.userLocation = {
        lat: position.coords.latitude,
        long: position.coords.longitude
      };
      Data.getData($scope.userLocation, function(fetchedData) {
        for(var i = 0; i < fetchedData.length; i++){
          var item = fetchedData[i];
          var now = new Date();
          var currentDay = now.getDay();
          var currentHour = parseInt("" + now.getHours() + now.getMinutes());
          var openNow = false;
          try {
            var restaurantHours = item.restaurant.hours.periods;
            for(var j = 0; j < restaurantHours.length; j++){
              if(restaurantHours[j].open.day === currentDay){
                var open = parseInt(restaurantHours[j].open.time);
                var close = parseInt(restaurantHours[j].close.time);
                if(currentHour >= open && currentHour <= close){
                  openNow = true;
                }
              }
            };
          } catch(err){ openNow = true; };
          var coords = {
            long: item.restaurant.loc[0],
            lat: item.restaurant.loc[1]
          };
          item.restaurant.dist = distance.calc($scope.userLocation, coords);
          item.restaurant.open = openNow;
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

  // Call main post request to load data from database
  $scope.pullFromDatabase();

  // Request to ping Google maps to search for new locations
  // On a delay to wait for geolocation data from pullFromDatabase
  setTimeout($scope.addToDatabase, 100);

  // Sets default order to be ascending
  $scope.reverse = true;
  $scope.order('restaurant.dist');
  $scope.contentLoading = true;
});
