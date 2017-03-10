/*Requires*/
const mongodb = require('mongodb').MongoClient;
const express = require('express');
const https = require('https');

const config = require('config');

// console.log(config.bingApiKey);
// console.log(config.mLabUrl);

/*Constants*/
const app = express();

const mongoUrl = config.mLabUrl;

const bingApiPath = "/bing/v5.0/images/search?"
const bingHost = "api.cognitive.microsoft.com"

/*Variables*/
var count = 5;

//init db pushes into db for testing
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

function bingImageApiCall(requestPath){
    console.log("bing request")
    console.log(requestPath)
    
    var options = {
        // url: bingHost + requestPath,
        host: bingHost,
        path: requestPath,
        headers:{
            "Ocp-Apim-Subscription-Key": config.bingApiKey
        }     
    }
   
        
    https.get(options, function(res){
        
        console.log("request made")
        var rawData = "";
        
        res.on("data", function(data){
            console.log("data received", data)
            rawData += data;
            // process.stdout.write(data);
            console.log(rawData)
            
        });
        res.on("end", function(){
           if (res.statusCode === 200){
                console.log("success", rawData)    
           } 
        });
        
        
        
    }).on("error", function(error){
        console.error(error);
    });
    
    
}



app.get("/api/imagesearch/*", function(req,res){
    //get the parameters
    
    // console.log(req.params[0]);
    var searchTerm = req.params[0];
    // console.log(searchTerm)
    
    // var offset = req.query.offset
    // console.log(offset)

    var searchQuery = bingApiPath +"q="+ searchTerm + "&count=" + count;
    var finalData = bingImageApiCall(searchQuery);
    // console.log(finalData)
    
});

app.get("/api/latest/imagesearch", function(req,res){
    console.log("checking latest")
    // initDb("mortise")
    res.send("latest")
});



app.listen(process.env.PORT || 8080, function(){
  console.log('App listening on port ', process.env.PORT);
  
})