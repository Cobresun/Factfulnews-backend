// Imported Libraries
const express = require('express')
const request = require('request')
require('dotenv').config()
let store = require('json-fs-store')();
let cron = require('node-cron');
const app = express()

// Libraries for scraping
const rp = require('request-promise');
const $ = require('cheerio');

// Constants
const LOCAL_PORT = 3000; // If this is being run locally then do it on this port
const newsAPIKey = process.env.NEWS_API;     // A file stored locally (or in Heroku) with the API key
const MAX_ARTICLES = 10;
const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${newsAPIKey}`;


// ~~~~~~~~ Helper Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Scrape the article text of the given url and return a string containing the article HTML text
function scrape(url, callback) {
	// Stores result
	const mainText = [];

	// Request the HTML at the given url
	rp(url).then( function(html){
		// For every paragraph in the retrieved HTML, push its content onto array
		$('p', html).each( function(i, elem) {
			mainText.push("<p>" + $(this).html() + "</p>");
		});

		// Return all paragraph html joined by newlines
		return callback(mainText.join(""));
	})
	.catch(function(err){
		return callback(undefined);
	});
}

// Calls the NewsAPI and gets the articles
function fetchAll(){
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
        	if (err) throw err;
        });
    });
}

// Determines the top articles to give to the user
function selectArticles(){
    let result = [];  

    store.load('all', function(err, articleObj){    // Read from the JSON file
        if (err) {
            sendResponse(false, undefined, "Error when reading JSON.", res);
        }

        // Retrieve only the specified max number of articles
        let articleList = articleObj.articles.slice(0, MAX_ARTICLES);
        
        articleIndex = 0;
        articleList.forEach(article => {
            // Discards 'broken' articles
            // TODO THIS CHANGES THE MAXNUMBER OF ARTICLES, NEED TO FIX THIS
            if (article.content != null && article.description != null){
                // Only send these elements to frontend, we don't need the rest of the article's details yet
                result.push({title:article.title, urlToImage:article.urlToImage, snippet:article.content, index:articleIndex, url:article.url});
                articleIndex++;
            }
        });

        // Placing the articles into the store
        store.add({id: 'all', articles: result}, function(err) {
            if (err) throw err;
        });

    });
}

function scrapeAll() {

    store.load('all', function(err, articleObj) {
        if(err) {
            sendResponse(false, undefined, "Error when reading JSON.", res);
        }; // err if JSON parsing failed


        // articleList.forEach(article => {
        //     // Discards 'broken' articles
        //     // TODO THIS CHANGES THE MAXNUMBER OF ARTICLES, NEED TO FIX THIS
        //     if (article.content != null && article.description != null){
        //         // Only send these elements to frontend, we don't need the rest of the article's details yet
        //         result.push({title:article.title, urlToImage:article.urlToImage, snippet:article.content, index:articleIndex, url:article.url});
        //         articleIndex++;
        //     }
        // });

        // Execute the scarping function on each
        articleList.forEach(scrape(article.url , text => {
            if (text)
                sendResponse(true, text, "Success", res);
            else
                sendResponse(false, url, "Unable to scrape text. Sent URL instead.", res);
         
        } ));

        // let articleURL = articleObj.articles[articleID].url;

        // // Scrape the given article and once done, it sends the text
        // scrape(articleURL, (text) => {
        //     if (text)
        //         sendResponse(true, text, "Success", res);
        //     else
        //         sendResponse(false, url, "Unable to scrape text. Sent URL instead.", res);
        // });
    })
}


// Prepares all the annotated articles for viewing
function refresh(){
    fetchAll();
    selectArticles();
    scrapeAll();
    //storeArticles();
    //annotate();
    //storeAnnotated();
}

// Creates and sends the response back to the requester
// Takes the parametres for creating a response and the reference to res to send it
function sendResponse(success, content, message, res){
	let response = {};

	// Prepare the response
	response["success"] = success;
	response["content"] = content;
	response["message"] = message;

	// Send the response
	res.contentType('application/json');    // Sending JSON to frontend
    res.send(JSON.stringify(response));     // Send the JSON!
}

// ~~~~~~~~~~~ Endpoint requests ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// When a request is made to root
app.get('/', function (req, res) {
	// Return simple message
	res.send('Welcome to the Factfulnews API!') 
});

// Request to /all
// Returns a JSON array of articles on success, otherwise undefined on error
app.get('/all', function (req, res) {

	// let result = [];    
 //    store.load('all', function(err, articleObj){    // Read from the JSON file
 //        if (err) {
 //        	sendResponse(false, undefined, "Error when reading JSON.", res);
 //        }

 //        let articleList = articleObj.articles.slice(0, MAX_ARTICLES);  // Shorten full list of articles to 10 for now
        
 //        articleIndex = 0;
 //        articleList.forEach(article => {
 //            // TODO: this changes the number of articles
 //            if (article.content != null && article.description != null){
 //                // Only send these elements to frontend, we don't need the rest of the article's details yet
 //                result.push({title:article.title, urlToImage:article.urlToImage, snippet:article.content, index:articleIndex, url:article.url});
 //                articleIndex++;
 //            }
 //        });

 //        sendResponse(true, result, "Success", res);
 //    });

    // This should just send the articles
    store.load('all', function(err, articleObj){ 
        sendResponse(true, articleObj, "Success", res);
    });
});

// Request to /all/article
// Returns a string with HTML of the article body or URL to the article on error.
app.get('/all/article', function (req, res) {
	// Retrieve the specific article asked for in the link
    // GET /all/article?id=<articleID>
    let articleID = req.query.id;

    store.load('all', function(err, articleObj) {
        if(err) {
        	sendResponse(false, undefined, "Error when reading JSON.", res);
       	}; // err if JSON parsing failed

        let articleURL = articleObj.articles[articleID].url;

        //TODO send the scraped body
        sendResponse(true, text, "Success", res);

        // // Scrape the given article and once done, it sends the text
        // scrape(articleURL, (text) => {
        // 	if (text)
        // 		sendResponse(true, text, "Success", res);
        // 	else
        // 		sendResponse(false, url, "Unable to scrape text. Sent URL instead.", res);
        // });
    })
});

// ~~~~~~~~~~~ Startup the backend and repeat every midnight ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Pipeline for getting the annotated articles
refresh();
cron.schedule('0 0 0 * * *', () => {    // runs every midnight
    console.log('running a task every midnight');
    refresh(); 
});


// All this port stuff is for heroku vs hosting locally
let port = process.env.PORT;
if (port == null || port == "") {
    port = LOCAL_PORT;
}
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
