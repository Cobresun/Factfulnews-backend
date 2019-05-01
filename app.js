// Imported Libraries
const express = require('express')
require('dotenv').config()
const store = require('json-fs-store')()
const cron = require('node-cron')
const app = express()

const fetchAllArticles = require("./lib/fetchAllArticles.js")
const selectArticles = require("./lib/selectArticles.js")
const prepArticles = require("./lib/prepArticles.js")
const annotateArticles = require("./lib/annotateArticles.js")

// Execute on this port if local
const {LOCAL_PORT} = require("./config.json")

// Prepares all the annotated articles for viewing
function refresh() {
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
    store.load('all', function(err, articleObj) {
    	if (err) {
    		next(err)
        	console.log("Error when reading JSON during endpoint call in /all")
       	}

       	for (let i = 0; i < articleObj.articles.length; i++) {
       		articleObj.articles[i].text = undefined
       	}

        res.send(JSON.stringify({"articles": articleObj.articles}))
    })
})

// Request to /all/article
// Returns a string with HTML of the article body or URL to the article on error.
app.get('/all/article', function (req, res, next) {
	// Retrieve the specific article asked for in the link
    // GET /all/article?id=<articleID>
    const articleID = req.query.id

    store.load('all', function(err, articleObj) {
        if (err) {
        	next(err)
        	console.log("Error when reading JSON during endpoint call in /all/article")
       	}

        res.send(JSON.stringify(articleObj.articles[articleID].text))

    })
})

// ~~~~~~~~~~~ Startup the backend and repeat every midnight ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Pipeline for getting the annotated articles
refresh() 
cron.schedule('0 0 * * *', () => {
    console.log('Crom job refreshing articles at midnight');
    refresh() 
	}, {
	scheduled: true,
	timezone: 'America/Regina'
})

// All this port stuff is for heroku vs hosting locally
let port = process.env.PORT
if (!port) {
    port = LOCAL_PORT
}
app.listen(port, () => console.log(`Example app listening on port ${port}!`))