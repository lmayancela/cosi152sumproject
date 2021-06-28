'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var reminderSchema = Schema( {
  name: String,
  time: String,
  task: String,
  channel: String,
  notes: String,
  userId: ObjectId,
  //participants: [String]
} );

module.exports = mongoose.model( 'reminder', reminderSchema );
