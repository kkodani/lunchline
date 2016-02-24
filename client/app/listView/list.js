//Retrieve information from the server and serve it in HTML.
myApp
.controller('listCtrl', function(distance, Data, $scope, $http, $stateParams, $state) {
   console.log('called');
   $scope.data = [];
   $scope.userLocation = {};
   $scope.transferEvent = function(obj) {
      Data.clickedItem = obj;
   }

   navigator.geolocation.getCurrentPosition(function(position){
      $scope.userLocation = {
         lat: position.coords.latitude,
         long: position.coords.longitude
      };
   });

   $scope.restInfo = function () {
      //Fetch data for that location
         Data.getData($scope.userLocation, function (fetchedData) {
            //Make a distance property for each restaurant
            for(var i = 0; i < fetchedData.length; i++) {
               var destination = {
                  lat: fetchedData[i].restaurant.geometry.location.lat,
                  long: fetchedData[i].restaurant.geometry.location.lng
               };
            fetchedData[i].restaurant.dist = distance.calc($scope.userLocation, destination);
            $scope.data = fetchedData;
            }
         });
      });
   }

   $scope.restInfo();
});
