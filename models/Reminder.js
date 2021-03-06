'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var reminderSchema = Schema( {
  name: String,
  time: Date,
  task: String,
  channel: String,
  notes: String,
  userId: ObjectId,
  rate: Number,
  //participants: [String]
} );

module.exports = mongoose.model( 'reminder', reminderSchema );
