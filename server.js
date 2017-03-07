var mongodb = require('mongodb').MongoClient;
var express = require('express');
var app = express();


app.get("/", function(req,res){
    
});

app.listen(process.env.PORT || 8080, function(){
  console.log('App listening on port ', process.env.PORT);
  
})