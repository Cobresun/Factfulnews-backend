const Mercury = require("@postlight/mercury-parser")
const sentiment = require('./sentimentAnalysis.js')

const {AVG_WORDS_PER_MINUTE} = require("../config.json")

// Scrape the article text of the given url and return a string containing the article HTML text
function scrape(url, callback) {
	Mercury.parse(url, { contentType: 'html' }).then(parsedResult => {
		return callback(parsedResult)
	})
	.catch(function(err) {
		console.error(err)
		return callback(undefined)
	})
}

function prepAll(store, category) {
	return new Promise((resolve, reject) => {
		store.load(category, function(err, articleObj) {
			if (err) {
				reject(err)
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
						if (!parsedResult) {
							// TODO: These articles are still being sent to frontend, which they shouldn't be
							console.error(`Error scraping article: ${article.url}`)
							completedArticles++
						}
						else {
							newArticle.text = parsedResult.content
							newArticle.timeToRead = Math.ceil(parsedResult.word_count / AVG_WORDS_PER_MINUTE)
							newArticle.sentiment = sentiment(parsedResult.content)
							result.push(newArticle)
							completedArticles++
						}
						console.log("Done preping: " + completedArticles + " / " + articleList.length + "\t(" + category + ")")
					
						if (completedArticles >= articleList.length) {
							store.add({id: category, articles: result}, function(err) {
								if (err){
									reject(err)
								}
								resolve()
							})
						}
					})
				}
				else completedArticles++
			}
		})
	})
}

module.exports = prepAll
