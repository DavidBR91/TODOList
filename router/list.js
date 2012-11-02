var mongoose = require('mongoose'),
    _ = require('underscore');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ListSchema = new Schema({
    name: String,
    tasks : [ObjectId]
});

var List = mongoose.model('List', ListSchema);