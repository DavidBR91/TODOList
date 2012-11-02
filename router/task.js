var mongoose = require('mongoose'),
    _ = require('underscore');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TaskSchema = new Schema({
    username: String,
    password: String,
    taskList : [ObjectId]
});

var TaskSchema = mongoose.model('Task', TaskSchema);