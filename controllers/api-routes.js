// // Requiring our Note and Article models
var Note = require("../models/note.js");
var Article = require("../models/article.js");

// / // Our scraping tools
var request = require("request");
var cheerio = require("cheerio");



module.exports = function(app) {

app.get("/", function(req, res) {

  

  //  Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
  //   // Log any errors
    if (error) {
      console.log(error);
    }
  //   // Or send the doc to the browser as a json object
    else {
  //     console.log(doc)
      res.render("home", {data: {articles: doc}})
    }
  });

  
});

// app.get("/articles", function(req, res) {
//   // Grab every doc in the Articles array
//   Article.find({}, function(error, doc) {
//     // Log any errors
//     if (error) {
//       console.log(error);
//     }
//     // Or send the doc to the browser as a json object
//     else {
//       res.json(doc);
//     }
//   });
// });


    // A GET request to scrape the echojs website
app.post("/", function(req, res) {
  var searchTerm = req.body.searchTerm
  
  // console.log(req.body.searchTerm)
  // First, we grab the body of the html with request
  request("http://www.reddit.com/r/"+searchTerm, function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("div.thing").each(function(i, element) {

      // Save an empty result object
      var result = {};

      result.title = $(element).find("p.title").find("a.title").text();
      result.link = $(element).find("li").find("a").attr("href");
      result.upvote = $(element).find("div.midcol").find("div.likes").text()
      result.rank = $(element).find("span.rank").text()
    

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          // console.log(doc);
        }
      });
        //  console.log(result)
    });
   res.redirect("/");
  });
  // Tell the browser that we finished scraping the text
  
});


}