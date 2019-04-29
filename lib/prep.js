const rp = require('request-promise')
const $ = require('cheerio')

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

        // Execute the scraping function on each
        articleList.forEach((article, index, articleArray) => {
        	scrape(article.url , text => {
	            if (text){
	        		articleArray[index].text = text
	            }
	            else {
	        		return callback({"success" : false, "message" : "Failed to scrape any text from this article"})
	            }
	         
	        })
        })

        articleObj.articles = articleList

        store.add(articleObj, function(err) {  // Storing all the articles to a JSON file
        	console.log(articleObj.articles[1].text)
        	if (err){
                return callback({"success" : false, "message" : "Error storing JSON after article fetch from News API."})
            }
        })
    })


}

module.exports = prepAll