const rp = require('request-promise');
const $ = require('cheerio');

// Scrape the article text of the given url and return a string containing the article HTML text
function scrape(url, callback) {
	// Stores result
	const mainText = [];

	// Request the HTML at the given url
	rp(url).then( function(html){
		// For every paragraph in the retrieved HTML, push its content onto array
		$('p', html).each( function(i, elem) {
			mainText.push("<p>" + $(this).html() + "</p>");
		});

		// Return all paragraph html joined by newlines
		return callback(mainText.join(""));
	})
	.catch(function(err){
		return callback(undefined);
	});
}

function scrapeAll(store) {

    store.load('all', function(err, articleObj) {
        if(err) {
            sendResponse(false, undefined, "Error when reading JSON.", res);
        }; // err if JSON parsing failed

        // Execute the scarping function on each
        articleList.forEach(scrape(article.url , text => {
            if (text)
                sendResponse(true, text, "Success", res);
            else
                sendResponse(false, url, "Unable to scrape text. Sent URL instead.", res);
         
        } ));
    })
}

module.exports = scrapeAll