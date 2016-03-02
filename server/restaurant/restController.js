var Restaurant = require('./restModel.js');
var PlaceSearch = require('google-locations');
var _ = require('underscore');

if (!process.env.GOOGLEPLACESKEY) {
  var config = require('../config.js');
}
var locations = new PlaceSearch(process.env.GOOGLEPLACESKEY || config.placesKey);

// Function called when post request is received with lat/long
// Makes a request to
exports.addRestaurants = function(req, res) {
  console.log('Receiving a request!', req.body);
  var lat = req.body.lat;
  var lng = req.body.long;
  var locations = new PlaceSearch(process.env.GOOGLEPLACESKEY || config.placesKey);

  // Make 'google place search' API call with lat and long
  locations.search({
    type: 'restaurant',
    location: [lat, lng],
    radius: 5000
  }, function(err, response) {
    if(err) { throw err; }
    _.each(response.results, function(item) {
      Restaurant.findOne({
        id: item.id
      }, function(err, obj) {
        if (obj === null) {
          // Make 'google place details' API call for new location
          locations.details({placeid: item.place_id}, function(err, response) {
            var geo = [item.geometry.location.lng, item.geometry.location.lat];
            var hours = response.result.opening_hours;
            var photos = response.result.photos;
            var restaurant = new Restaurant({
              wait: [
                {
                  wait: "3_grey", 
                  timestamp: new Date()
                }
              ],
              loc: geo,
              hours: hours,
              id: item.id,
              name: item.name,
              photos: photos,
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
          });
        }
      });
    })
    res.end();
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
  var query = {
    place_id: req.body.place_id,
  };

  var update = {
    $push: {"wait": {waitColor: req.body.waitObj.waitColor, timestamp: new Date()}}
  }

  // Upsert updates instead of adding a new entry
  var options = {
    upsert: true,
    new: true
  };

  Restaurant.findOneAndUpdate(query, update, options, function(err, restaurant) {
    if (err) {
      throw err;
    }
    res.json(restaurant);
  });
};
