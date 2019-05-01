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

function prepAll(store, category, callback) {
    store.load(category, function(err, articleObj) {
        if (err) {
            return callback({"success" : false, "message" : "Error when reading JSON during scraping."})
        }

        const articleList = articleObj.articles

        const result = []

        let completedArticles = 0

        for (let index = 0; index < articleList.length; index++) {
        	const article = articleList[index]

            if (article.content !== null && article.description !== null){
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

<<<<<<< HEAD:lib/prepArticles.js
		            if (completedArticles >= articleList.length){
		            	store.add({id: 'all', articles: result}, function(err) {
=======
		            if (completedArticles === articleList.length){
		            	store.add({id: category, articles: result}, function(err) {
>>>>>>> 50dea8c1af146588510668d72190078badd1a70d:lib/prep.js
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
