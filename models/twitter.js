'use strict';
const mongoose = require('mongoose'),
  twitterSchema = mongoose.Schema({
    twitterObject: Array,
  });

module.exports = mongoose.model('Twitter', twitterSchema);
