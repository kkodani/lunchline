var Restaurant = require('./restModel.js');
var PlaceSearch = require('google-locations');
var _ = require('underscore');

if (!process.env.GOOGLEPLACESKEY) {
  var config = require('../config.js');
}

// Function called when post request is received with lat/long
// Makes a request to
exports.addRestaurants = function(req, res) {
  console.log('Receiving a request!', req.body);
  var lat = req.body.lat;
  var lng = req.body.long;
  var locations = new PlaceSearch(process.env.GOOGLEPLACESKEY || config.placesKey);

  // Make google places API call with lat and long
  locations.search({
    keyword: 'restaurants',
    location: [lat, lng],
    radius: 5000
  }, function(err, response) {
    if (err) {
      throw err;
    }
    // Loop through each of the response results and check if restaurant is in database
    // If not, put it in the database and initiate it to grey
    _.each(response.results, function(item) {
      Restaurant.findOne({
        id: item.id
      }, function(err, obj) {
        if (obj === null) {
          var geo = [item.geometry.location.lng, item.geometry.location.lat];
          var restaurant = new Restaurant({
            wait: "3_grey",
            loc: geo,
            id: item.id,
            name: item.name,
            place_id: item.place_id,
            price_level: item.price_level,
            rating: item.rating,
            types: item.types[0],
            vicinity: item.vicinity
          });
          restaurant.save(function(err) {
            if (err) {
              console.log("not saved");
              throw err;
            }
          });
        }
      });
    })
    res.send();
  });
};

exports.getDatabase = function(req, res) {
  var coords = [];
  coords[0] = req.body.long;
  coords[1] = req.body.lat;
  var maxRadius = 5;
  // convert to radians
  var maxDistance = maxRadius/6371;

  Restaurant.find({'loc': {
    $geoWithin: {
      $centerSphere: [coords, maxDistance]
    }
  }}, function(err, results) {
    if(err){
      console.log(err);
      throw err;
    }
    res.json(results);
  });
};

// Function that updates the wait time/color in the database
exports.updateWait = function(req, res) {
  // console.log("request obj: ", req.body);
  var query = {
    place_id: req.body.place_id
  };

  // console.log("+++ query", query);
  var update = {
    wait: req.body.wait
  };

  // Upsert updates instead of adding a new entry
  var options = {
    upsert: true
  };

  Restaurant.findOneAndUpdate(query, update, options, function(err, restaurant) {
    if (err) {
      throw err;
    }
    res.json(restaurant);
  });
};
