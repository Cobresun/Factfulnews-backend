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

// Constants
const {LOCAL_PORT} = require("./config.json")
const categoryList = ['all', 'business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology']

function refreshAll() {
	for (let i = 0; i < categoryList.length; i++){
		refresh(categoryList[i])
	}
}

// Prepares all the annotated articles for viewing
function refresh(category){
    fetchAllArticles(store, category, status => {
        console.log("Fetching complete. " + (status.success ? "Success." : "Failure."))
    	if (status.success)
		    prepArticles(store, category, status => {
            console.log("Prepping complete. " + (status.success ? "Success." : "Failure."))
		    	if (status.success)
				    selectArticles(store, category, status => {
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


// Returns a JSON array of articles on success, otherwise undefined on error
app.get('/:category', function (req, res, next) {
	category = req.params.category
	if (categoryList.includes(category)){
		store.load(category, function(err, articleObj){
			if (err) {
				next(err)
				console.log("Error when reading JSON during endpoint call in /category")
			}

			for (let i = 0; i < articleObj.articles.length; i++) {
				articleObj.articles[i].text = undefined
			}

			res.send(JSON.stringify({"articles": articleObj.articles}))
		})
	}
	else {
		res.send(category + " is not one of the approved categories.")
	}
})

// Returns a string with HTML of the article body or URL to the article on error.
app.get('/:category/article', function (req, res, next) {
    const articleID = req.query.id
	category = req.params.category
	if (categoryList.includes(category)){
		store.load(category, function(err, articleObj) {
			if (err) {
				next(err)
				console.log("Error when reading JSON during endpoint call in /category/article")
			}

			res.send(JSON.stringify(articleObj.articles[articleID].text))
		})
	}
	else {
		res.send(category + " is not one of the approved categories.")
	}
})


// ~~~~~~~~~~~ Startup the backend and repeat every midnight ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Pipeline for getting the annotated articles
refreshAll() 
cron.schedule('0 0 * * *', () => {
    console.log('Crom job refreshing articles at midnight');
    refreshAll()  
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