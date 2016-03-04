/* Handles controller code for main restaurant info */

myApp.controller('restCtrl', function($scope, distance, Data, Update, WaitOps) {

  $scope.restaurant = {
    id: '',
    name: '',
    category: '',
    lat: '',
    lng: '',
    rating: 0,
    price: 0,
    address: '',
    hours: '',
    waitArr: ''
  };


  $scope.timestamp = "";

  $scope.$watch(function() { return Data.clickedItem }, function(n, o) {
    updateScopeRestaurant();
  });

  // Check if object doesn't exist, use session storage.
  // This way, on refresh or back, it won't have all undefined values
  if (!Data.clickedItem.id) {
    Data.clickedItem = JSON.parse(sessionStorage.tempStorage);
  }

  if (!Data.userLoc.lat) {
    Data.userLoc = JSON.parse(sessionStorage.tempStorage2);
  }
  $scope.loc = Data.userLoc;

  function getTime(wait) {
    return WaitOps.getTimestamp(wait)
  };

  $scope.getSlicedTime = function(timestamp) {
    return WaitOps.getSlicedTime(timestamp);
  };

  $scope.getWaitColor = function(color) {
    return WaitOps.getWaitColor(color);
  };

  $scope.getLatestWaitColor = function(wait) {
    var color = WaitOps.getLatest(wait);
    return WaitOps.getWaitColor(color);
  };

  function updateTimestamp() {
    $scope.timestamp = getTime($scope.restaurant.waitArr);
  };

  function updateScopeRestaurant() {

    if (Data.clickedItem.id) {
      // Get data from clicked item
      var item = Data.clickedItem;

      $scope.restaurant.place_id = item.place_id;
      $scope.restaurant.name = item.name;

      var type = item.types;
      var capitalizedType = type.charAt(0).toUpperCase() + type.substring(1);

      $scope.restaurant.category = capitalizedType;
      $scope.restaurant.address = item.vicinity;
      $scope.restaurant.waitArr = item.wait;
      $scope.restaurant.lat = item.loc[1];
      $scope.restaurant.lng = item.loc[0];
      $scope.restaurant.dist = item.dist;

      // Get restaurant rating and build string for star display
      $scope.restaurant.rating = item.rating;
      var whiteStar = String.fromCharCode(9734);
      var blackStar = String.fromCharCode(9733);
      var starArray = [];

      for (var i = 0; i < 5; i++) {
        starArray.push(whiteStar);
      }

      for (var i = 0; i < Math.round($scope.restaurant.rating); i++) {
        starArray.splice(i, 1, blackStar);
      }

      $scope.starString = starArray.join('');

      // Calculate Price And Convert to Dollar Signs
      var price = item.price_level;
      var dollarSigns = '';

      for (var i = 0; i < price; i++) {
        dollarSigns += '$';
      }

      $scope.restaurant.price = dollarSigns;
      updateTimestamp();

      // Change color of main indicator div based on wait time from database
      switch (WaitOps.getLatest($scope.restaurant.waitArr)) {
        case '2_red':
          // angular.element(document.querySelector('#currWait')).addClass('red');
          $scope.waitString = '> 30 Mins';
          break;
        case '1_yellow':
          // angular.element(document.querySelector('#currWait')).addClass('yellow');
          $scope.waitString = '~ 20 Mins';
          break;
        case '0_green':
          // angular.element(document.querySelector('#currWait')).addClass('green');
          $scope.waitString = '< 10 Mins';
          break;
        case '3_grey':
          // angular.element(document.querySelector('#currWait')).addClass('oliveGreen');
          $scope.waitString = 'not available';
          break;
      }
    } else { // No data loaded.  Load default values.
      angular.element(document.querySelector('#currWait')).addClass('oliveGreen');
      $scope.waitString = 'not available';
    }

  }
  updateScopeRestaurant();

  // When a Check in Button is clicked, update the wait time on page and DB
  $scope.updateWait = function(waitColor) {

    var sendObj = {
      place_id: $scope.restaurant.place_id,
      waitObj: {waitColor: waitColor}
    };
      if($scope.restaurant.dist <= 1){
        updateWaitColorDiv(waitColor);
        Update.updateWait(sendObj, function(restaurantData) {
          restaurantData.dist = $scope.restaurant.dist;
          sessionStorage["tempStorage"] = JSON.stringify(restaurantData);
          Data.clickedItem = JSON.parse(sessionStorage.tempStorage);
          updateScopeRestaurant();
        });
      } else {
        swal({
          html: '<p id="sweetAlert">You must be near the location to check in!</p>',
          type: 'error',
          timer: 1500,
          width: 600,
          showConfirmButton: false
        });
      }
    
  };


  // Sweet Alert popup to thank users when they check in a wait time.
  function updateWaitColorDiv(wait) {
    swal({
      html: '<p id="sweetAlert">Thanks for checking in!</p>',
      type: 'success',
      timer: 1500,
      width: 600,
      showConfirmButton: false
    });

    // Change the wait color of the div by removing and adding classes
    switch (wait) {
      case '2_red':
        angular.element(document.querySelector('#currWait')).removeClass('yellow');
        angular.element(document.querySelector('#currWait')).removeClass('green');
        angular.element(document.querySelector('#currWait')).removeClass('oliveGreen');
        angular.element(document.querySelector('#currWait')).addClass('red');
        $scope.waitString = '> 30 Mins';
        break;
      case '1_yellow':
        angular.element(document.querySelector('#currWait')).removeClass('red');
        angular.element(document.querySelector('#currWait')).removeClass('green');
        angular.element(document.querySelector('#currWait')).removeClass('oliveGreen');
        angular.element(document.querySelector('#currWait')).addClass('yellow');
        $scope.waitString = '~ 20 Mins';
        break;
      case '0_green':
        angular.element(document.querySelector('#currWait')).removeClass('yellow');
        angular.element(document.querySelector('#currWait')).removeClass('red');
        angular.element(document.querySelector('#currWait')).removeClass('oliveGreen');
        angular.element(document.querySelector('#currWait')).addClass('green');
        $scope.waitString = '< 10 Mins';
        break;
    }
  }
});
myApp.filter('reverse', function() {
  return function(items) {
    return items.slice(1).reverse();
  };
});
