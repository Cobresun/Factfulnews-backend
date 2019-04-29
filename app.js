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

// ~~~~~~~~~~~ Endpoint requests ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// When a request is made to root
app.get('/', function (req, res) {
	// Return simple message
	res.send('Welcome to the Factfulnews API!') 
})

// Request to /all
// Returns a JSON array of articles on success, otherwise undefined on error
app.get('/all', function (req, res, next) {
    // This should just send the articles
    store.load('all', function(err, articleObj){
    	if (err) {
    		next(err)
        	console.log("Error when reading JSON during endpoint call in /all")
       	}
        res.send(JSON.stringify({"articles": articleObj.articles}))
    })
})

// Request to /all/article
// Returns a string with HTML of the article body or URL to the article on error.
app.get('/all/article', function (req, res, next) {
	// Retrieve the specific article asked for in the link
    // GET /all/article?id=<articleID>
    let articleID = req.query.id

    store.load('all', function(err, articleObj) {
        if (err) {
        	next(err)
        	console.log("Error when reading JSON during endpoint call in /all/article")
       	}

        res.send(JSON.stringify(articleObj.articles[articleID]))

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
