const express = require('express')
const request = require('request')
require('dotenv').config()
const app = express()
const LOCAL_PORT = 3000
const newsAPIKey = process.env.NEWS_API

var url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${newsAPIKey}`
var articles

request(url, function(error, response, body){
    if (error) {
        console.log('error:', error); // Print the error if one occurred
    }
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    const bod = JSON.parse(body);
    articles = bod.articles
})

app.get('/', function (req, res) {
    res.send('Welcome to the factfulnews API! Enter a more specific url to access more!')
})

// /all should return 10 article headlines/images right now
app.get('/all', function (req, res) {
    var result = [];
    articles = articles.slice(0, 10)
    articles.forEach(article => {
        result.push({title:article.title, urlToImage:article.urlToImage, snippet:article.content})
    });

    res.contentType('application/json');
    res.send(JSON.stringify(result));
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = LOCAL_PORT;
}
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
