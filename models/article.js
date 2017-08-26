var mongoose = require("mongoose");

var Schema = mongoose.Schema;


var ArticleSchema = new Schema({
  // title is a required string
  title: {
    type: String,
    required: true
  },
  // link is a required string
  link: {
    type: String,
    required: true
  },
  upvote: {
    type: String,
    required: true
  },
  rank: {
    type: Number
  },
  image: {
    type: String,
    default: '/assets/image/Reddit-Logo.jpeg',
    required: true
  },
  saved: {
    type: Boolean,
    default: false,
    required: true
  },
  // This only saves one note's ObjectId, ref refers to the Note model
  note: [{
    type: Schema.Types.ObjectId,
    ref: "Note"
  }]
});

// Create the Article model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export the model
module.exports = Article;