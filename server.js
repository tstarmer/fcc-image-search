const mongodb = require('mongodb').MongoClient;
const express = require('express');

const config = require('config');

console.log(config.bingApiKey);
console.log(config.mLabUrl);

const app = express();

const mongoUrl = config.mLabUrl;

const bingApiUrl = "https://api.cognitive.microsoft.com/bing/v5.0/images/search"


//init db
function initDb(item){
    mongodb.connect(mongoUrl, function(err,db){
        if(err){
            console.log(err)
        }else{
            var ltSearches = db.collection("latest-search")
           
            ltSearches.insertOne({"something4":"another-something4"});
           
            db.close();
            
        }
    })
}


app.get("/api/imagesearch/*", function(req,res){
    //get the parameters
    
    console.log(req.params[0]);
    var searchTerm = req.params[0];
    console.log(searchTerm)
    
    var offset = req.query.offset
    console.log(offset)
    
    console.log(req.query)
    console.log("imagesearch")
    var output = "looking for " + JSON.stringify(req.params); 
    console.log(output)
    res.send(output)
});

app.get("/api/latest/imagesearch", function(req,res){
    console.log("checking latest")
    initDb("mortise")
    res.send("latest")
});



app.listen(process.env.PORT || 8080, function(){
  console.log('App listening on port ', process.env.PORT);
  
})