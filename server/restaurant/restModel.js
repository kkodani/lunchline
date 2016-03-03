//define schema for restaurant
var mongoose = require('mongoose');

var restaurantSchema = new mongoose.Schema({
  wait: String,
  loc: {
    type: [Number],
    index: '2dsphere'
  },
  hours: {},
  id: String,
  name: String,
  photos : {},
  place_id: String,
  price_level: Number,
  rating: Number,
  types : String,
  vicinity: String
});

module.exports = mongoose.model('Restaurant3', restaurantSchema)
