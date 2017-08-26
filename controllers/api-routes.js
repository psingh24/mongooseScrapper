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

app.get("/saved", function(req, res) {
  // Grab every doc in the Articles array
   Article.find({ saved: true})
    // ..and string a call to populate the entry with the books stored in the library's books array
    // This simple query is incredibly powerful. Remember this one!
    .populate("note")
    // Now, execute that query
    .exec(function(error, doc) {
      // Send any errors to the browser
      if (error) {
        res.send(error);
      }
      // Or, send our results to the browser, which will now include the books stored in the library
      else {
        // console.log(doc[0].note[0].body)
        res.render("saved", {data: {articles: doc}})
      }
    });
});

app.post("/save/:id", function(req, res) {

  console.log(req.params.id)
  Article.update({ _id: req.params.id }, { $set: { saved: true }}, function(err, data) {
    if (err) {
      throw err;
    } else {
      res.redirect("/")
    }
  });


  // res.redirect("/")
});


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

    var imageUrl = $(element).find("a.thumbnail").find("img").attr("src");
    var imageSliced;
      // console.log(imageUrl)

      if (imageUrl === undefined) {
        imageSliced = "/assets/image/Reddit-Logo.jpeg"
      } else {
        imageSliced = "http:"+imageUrl
      }
    



      result.title = $(element).find("p.title").find("a.title").text();
      result.link = $(element).find("li").find("a").attr("href");
      result.upvote = $(element).find("div.midcol").find("div.likes").text()
      result.rank = $(element).find("span.rank").text()
      result.image = imageSliced;
    //  console.log($(element).find("a.thumbnail"))
    

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

app.post("/note/:id", function(req, res) {
  console.log(req.body.note)
  var id =  req.params.id;

  var note = {
    title: req.params.id,
    body: req.body.note
  }

  var newNote = new Note(note);
  console.log(newNote)

  newNote.save(function(err, data) {
    if (err) {throw err;}
    else {
      console.log(data)
      Article.findByIdAndUpdate(id, { $push: { "note": data._id } }, { new: true }, function(error, doc) {
        // Send any errors to the browser
        if (error) {
          res.send(error);
        }
        // Or send the doc to the browser
        else {
          console.log(doc)
           res.redirect("/saved")
        }
      });
    }

  })

  // res.redirect("/saved")
})


app.post("/unsave/:id", function(req, res) {

    Article.update({ _id: req.params.id }, { $set: { saved: false }}, function(err, data) {
    if (err) {
      throw err;
    } else {
      res.redirect("/saved")
    }
  });

});

app.post("/clear" , function(req, res) {

  Article.remove({ saved: false }, function (err) {
  if (err) {
    throw err;
  } else {
      res.redirect("/")
    }
  
});
});

app.post("/delete/note/:id", function(req, res) {
  

  Note.remove({ _id: req.params.id }, function (err) {
  if (err) {
    throw err;
  } else {
       res.redirect("/saved")
    }
  
});
 

})
}