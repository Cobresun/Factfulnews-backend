const rp = require('request-promise')
const $ = require('cheerio')
const sentiment = require('./sentimentAnalysis.js')

// Scrape the article text of the given url and return a string containing the article HTML text
function scrape(url, callback) {
	// Stores result
	const mainText = []

	// Request the HTML at the given url
	rp(url).then( function(html){
		// For every paragraph in the retrieved HTML, push its content onto array
		$('p', html).each( function(i, elem) {
			mainText.push("<p>" + $(this).html() + "</p>")
		})

		// Return all paragraph html joined by newlines
		return callback(mainText.join(""))
	})
	.catch(function(err){
		return callback(undefined)
	})
}

function prepAll(store, callback) {
    store.load('all', function(err, articleObj) {
        if (err) {
            return callback({"success" : false, "message" : "Error when reading JSON during scraping."})
        }

        let articleList = articleObj.articles

        let result = []

        let completedArticles = 0

        for (let index = 0; index < articleList.length; index++) {
        	let article = articleList[index]

            if (article.content != null && article.description != null){
            	// Only send these elements to frontend, we don't need the rest of the article's details yet
                let newArticle = {title:article.title, urlToImage:article.urlToImage, snippet:article.content, url:article.url}

            	scrape(article.url , text => {
		            completedArticles++
		            if (text){
		            	console.log("Done Scraping: " + completedArticles + " / " + articleList.length)

		            	newArticle.text = text
									newArticle.sentiment = sentiment(text)
		            	result.push(newArticle)
		            }

		            if (completedArticles === articleList.length){
		            	store.add({id: 'all', articles: result}, function(err) {
				    	if (err){
				            return callback({"success" : false, "message" : "Error storing JSON after scraping."})
				        }
				        return callback({"success" : true})
					})
		            }
	        	})
            }
            else completedArticles++
        }
    })

}

module.exports = prepAll
