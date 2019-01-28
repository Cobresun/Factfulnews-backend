const express = require('express')
const request = require('request')
require('dotenv').config()
let store = require('json-fs-store')();
let cron = require('node-cron');
const app = express()
const LOCAL_PORT = 3000 // If this is being run locally then do it on this port
const newsAPIKey = process.env.NEWS_API     // A file stored locally (or in Heroku) with the API key
const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${newsAPIKey}`

function fetch(){
    store.remove('all', function(err) {     // Empty the file
        // If (err) throw err; // err if the file removal failed <- commented out because it didn't exist
      });
    request(url, function(error, response, body){
        if (error) {
            console.log('error:', error); // Print the error if one occurred
        }
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        const bod = JSON.parse(body);   // Get the JSON sent to us from NEWS API
        let articles = bod.articles 
        let articleList = {
            id: 'all',  // Adding an id to the store for when we eventually add more categories
            articles: articles, 
        };
        store.add(articleList, function(err) {  // Storing all the articles to a JSON file
            if (err) throw err
        })
    })
}

fetch()     // When the app is first run it will do a fetch, after which it runs every midnight
cron.schedule('0 0 0 * * *', () => {    // runs every midnight
    console.log('running a task every midnight');
    fetch() 
  });

app.get('/', function (req, res) {  // When the root route is accessed
    res.send('Welcome to the Factfulnews API!') 
})

app.get('/all', function (req, res) {   // When the /all route is accessed
    let result = [];    
    store.load('all', function(err, articleObj){    // Read from the JSON file
        if(err) throw err; // err if JSON parsing failed
        let articleList = articleObj.articles.slice(0, 10)  // Shorten full list of articles to 10 for now
        articleIndex = 0
        articleList.forEach(article => {
            // Only send these elements to frontend, we don't need the rest of the article's details yet
            result.push({title:article.title, urlToImage:article.urlToImage, snippet:article.content, index:articleIndex})
            articleIndex++
        });
        res.contentType('application/json');    // Sending JSON to frontend
        res.send(JSON.stringify(result));       // Send the JSON!
      });
})

// All this port stuff is for heroku vs hosting locally
let port = process.env.PORT;
if (port == null || port == "") {
  port = LOCAL_PORT;
}
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
