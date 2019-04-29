// Imported Libraries
const express = require('express')
require('dotenv').config()
let store = require('json-fs-store')()
let cron = require('node-cron')
const app = express()

const fetchAllArticles = require("./lib/fetchAll.js")
const selectArticles = require("./lib/select.js")
const prepArticles = require("./lib/prep.js")
const annotateArticles = require("./lib/annotate.js")

// Constants
const LOCAL_PORT = 3000 // If this is being run locally then do it on this port

// ~~~~~~~~ Helper Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Prepares all the annotated articles for viewing
function refresh(){
    fetchAllArticles(store, status => {
        console.log("Fetching complete. " + (status.success ? "Success." : "Failure."))
    	if (status.success)
		    prepArticles(store, status => {
            console.log("Prepping complete. " + (status.success ? "Success." : "Failure."))
		    	if (status.success)
				    selectArticles(store, status => {
                        console.log("Selecting complete. " + (status.success ? "Success." : "Failure."))

				    	if (status.success)
						    annotateArticles(store, status => {console.log("Annotating complete. " + (status.success ? "Success." : "Failure."))})
				    })
		    })
    })
}

// Creates and sends the response back to the requester
// Takes the parametres for creating a response and the reference to res to send it
function sendResponse(success, content, message, res){
	let response = {}

	// Prepare the response
	response["success"] = success
	response["content"] = content
	response["message"] = message

	// Can store log of erros here if needed to catch errors
	if (!success)
		console.log("message")

	// Send the response
	res.contentType('application/json')    // Sending JSON to frontend
    res.send(JSON.stringify(response))     // Send the JSON!
}

// ~~~~~~~~~~~ Endpoint requests ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// When a request is made to root
app.get('/', function (req, res) {
	// Return simple message
	res.send('Welcome to the Factfulnews API!') 
})

// Request to /all
// Returns a JSON array of articles on success, otherwise undefined on error
app.get('/all', function (req, res) {
    // This should just send the articles
    store.load('all', function(err, articleObj){
    	if (err) {
        	sendResponse(false, undefined, "Error when reading JSON during endpoint call.", res)
       	}
        sendResponse(true, articleObj, "Success", res)
    })
})

// Request to /all/article
// Returns a string with HTML of the article body or URL to the article on error.
app.get('/all/article', function (req, res) {
	// Retrieve the specific article asked for in the link
    // GET /all/article?id=<articleID>
    let articleID = req.query.id

    store.load('all', function(err, articleObj) {
        if (err) {
        	sendResponse(false, undefined, "Error when reading JSON during endpoint call.", res)
       	}

        let article = articleObj.articles[articleID]

        sendResponse(true, article, "Success", res)

    })
})

// ~~~~~~~~~~~ Startup the backend and repeat every midnight ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Pipeline for getting the annotated articles
refresh()
cron.schedule('0 0 0 * * *', () => {    // runs every midnight
    console.log('running a task every midnight')
    refresh() 
})


// All this port stuff is for heroku vs hosting locally
let port = process.env.PORT
if (port == null || port == "") {
    port = LOCAL_PORT
}
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
