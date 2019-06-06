const Mercury = require("@postlight/mercury-parser")
const sentiment = require('./sentimentAnalysis.js')

const {AVG_WORDS_PER_MINUTE} = require("../config.json")
const scrappedContentType = 'html'

// Scrape the article text of the given url and return a string containing the article HTML text
function scrape(url, callback) {
	const mainText = []

	Mercury.parse(url, { contentType: scrappedContentType }).then(parsedResult => {
		return callback(parsedResult)
	})
	.catch(function(err){
		console.log(err)
		return callback(undefined)
	})
}

function prepAll(store, category, callback) {
    store.load(category, function(err, articleObj) {
        if (err) {
            return callback({"success" : false, "message" : "(" + category + ") Error when reading JSON during scraping."})
        }

        const articleList = articleObj.articles

        const result = []

        let completedArticles = 0

        for (let index = 0; index < articleList.length; index++) {
        	const article = articleList[index]

            if (article.content !== null && article.description !== null){
            	// Only send these elements to frontend, we don't need the rest of the article's details yet
                let newArticle = {title:article.title, urlToImage:article.urlToImage, snippet:article.content, url:article.url}

            	scrape(article.url , parsedResult => {
		            completedArticles++
		            
					console.log("Done Scraping: " + completedArticles + " / " + articleList.length + "\t(" + category + ")")

					newArticle.text = parsedResult.content
					newArticle.timeToRead = Math.ceil(parsedResult.word_count / AVG_WORDS_PER_MINUTE)
					newArticle.sentiment = sentiment(parsedResult.content)
					result.push(newArticle)
		            

		            if (completedArticles >= articleList.length) {
		            	store.add({id: category, articles: result}, function(err) {
				    	if (err){
				            return callback({"success" : false, "message" : "(" + category + ") Error storing JSON after scraping in."})
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
