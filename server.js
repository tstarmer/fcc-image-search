/*Requires*/
const mongodb = require('mongodb').MongoClient;
const express = require('express');
const https = require('https');

const config = require('config');

/*Constants*/
const app = express();

const mongoUrl = config.mLabUrl;

const bingApiPath = "/bing/v5.0/images/search?"
const bingHost = "api.cognitive.microsoft.com"

/*Variables*/
var count = 5;


//init db pushes into db for testing
function addToDb(term,timestamp){
    mongodb.connect(mongoUrl, function(err,db){
        if(err){
            console.log(err)
        }else{
            console.log("add to db");
            var ltSearches = db.collection("latest-search")
            ltSearches.insertOne({"term": term,
            "when":timestamp});
           
            db.close();
            
        }
    })
}

function bingImageApiCall(requestPath, callback){
    console.log("bing request")
    // console.log(requestPath)
    
    var options = {
        // url: bingHost + requestPath,
        host: bingHost,
        path: requestPath,
        headers:{
            "Ocp-Apim-Subscription-Key": config.bingApiKey
        }     
    }
   
    var rawData = "";
    
    https.get(options, function(res){
        
        console.log("request made")
        
        res.on("data", function(data){
            // console.log("data received", data)
            rawData += data;

        });
        res.on("end", function(){
           if (res.statusCode === 200){
                // console.log("success", rawData)
                callback(rawData);
           } 
        });
    
    }).on("error", function(error){
        console.error(error);
    });
  
}

function extractUrl(urlString){
    
    var urlStart = urlString.indexOf("r=")+2
    var urlEnd = urlString.lastIndexOf("&p=DevEx")
    urlString = decodeURIComponent(urlString.substring(urlStart, urlEnd));
    // console.log(urlString)
    return urlString
}


function parseData(data){
    data = JSON.parse(data)
    
    // console.log(data.value)
    const items = data.value
    var item;
    
    var parsedData = [];
    for(var i=0; i<data.value.length; i++){
        var imageUrl = extractUrl(items[i].contentUrl)
        var protocol = "http://";
        
        if(imageUrl.includes("https")){
            protocol = "https://"
        }
        
        item = {
            url:imageUrl,
            snippet: items[i].name,
            thumbnail: items[i].thumbnailUrl,
            context: protocol + items[i].hostPageDisplayUrl
        }
        parsedData.push(item);
    }
    // console.log(parsedData)
    
    return parsedData;
}


app.get("/api/imagesearch/*", function(req,res){

    var searchTerm = req.params[0];
    // console.log(searchTerm)
    
    var time = new Date().toUTCString();
        console.log(time);
    
    addToDb(searchTerm, time)
    
    
    var offset = req.query.offset
    // console.log(offset)

    var searchQuery = bingApiPath +"q="+ searchTerm + "&count=" + count;
    
    if(offset){
        searchQuery += "&offset=" + offset;
    }
 
    bingImageApiCall(searchQuery, function(data){
        var result = parseData(data)
        // console.log("result", result)
        res.send(result)
    });
    
});

app.get("/api/latest/imagesearch", function(req,res){
    console.log("checking latest")
    // var latestSearches;
    
    mongodb.connect(mongoUrl, function(err,db){
        if(err){
            console.log(err)
        }else{
            var ltSearches = db.collection("latest-search")
            
            console.log("get fromdb");
            
            ltSearches.find({when:{$exists:true}}, {_id:0, term:1, when:1}).sort({when:-1}).limit(10).toArray(function(err,items){
                if(err){
                    console.log(err)
                }else{
                    // console.log("data?")
                    
                    // console.log("lt", latestSearches)
                    // console.log("i", items)
                    res.send(items)
                    db.close();
                }
                
            })
         
        }
        
                    
    });
    
    
});


app.listen(process.env.PORT || 8080, function(){
  console.log('App listening on port ', process.env.PORT);
  
})