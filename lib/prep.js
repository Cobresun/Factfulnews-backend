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

function scrapeAll(store, callback) {

    store.load('all', function(err, articleObj) {
        if (err) {
        	let errorMsg = "Error when reading JSON during scraping."
        	console.log(errorMsg)
            return callback({"success" : false, "message" : errorMsg, "res" : res})
        }

        // Execute the scraping function on each
        articleList.forEach(scrape(article.url , text => {
            if (text)
                return callback({"success" : true, "content" : text, "message" : "Success", "res" : res})
            else{
            	let errorMsg = "Unable to scrape text. Sent URL instead."
        		console.log(errorMsg)
                return callback({"success" : false, "content" : url, "message" : errorMsg, "res" : res})
            }
         
        } ))
    })


}

module.exports = scrapeAll