const mongodb = require('mongodb').MongoClient;
const express = require('express');
const app = express();

const mongoUrl = process.env.MONGOLAB_URI;

//init db
function initDb(item){
    mongodb.connect(mongoUrl, function(err,db){
        if(err){
            console.log(err)
        }else{
            var ltSearches = db.collection("latest-search")
           
            ltSearches.insertOne({"something2":"another-something"});
           
            db.close();
            
        }
    })
}


app.get("/api/imagesearch/", function(req,res){
    console.log("imagesearch")
    res.send("query")
});

app.get("/api/latest/imagesearch", function(req,res){
    console.log("checking latest")
    initDb("mortise")
    res.send("latest")
});



app.listen(process.env.PORT || 8080, function(){
  console.log('App listening on port ', process.env.PORT);
  
})