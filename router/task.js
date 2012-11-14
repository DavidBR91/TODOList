var mongoose = require('mongoose'),
    _ = require('underscore');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TaskSchema = new Schema({
    name: String,
    date: Date,
    completed : Boolean
});

var TaskSchema = mongoose.model('Task', TaskSchema);