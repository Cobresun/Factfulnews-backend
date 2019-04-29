const newsAPIKey = process.env.NEWS_API     // A file stored locally (or in Heroku) with the API key
const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${newsAPIKey}`
const request = require('request')

// Calls the NewsAPI and gets the articles
function fetchAll(store, callback){
    store.remove('all', function(err) {     // Empty the file
        // If (err) throw err // err if the file removal failed <- commented out because it didn't exist
    })
    request(url, function(error, response, body){
    	if (error) {
            return callback({"success" : false, "message" : ("Error fetching from News API:\n" + error)})
        }

        console.log('statusCodeeeeee:', response && response.statusCode) // Print the response status code if a response was received
        
        const bod = JSON.parse(body)   // Get the JSON sent to us from NEWS API
        let articles = bod.articles 
        let articleList = {
            id: 'all',  // Adding an id to the store for when we eventually add more categories
            articles: articles, 
        }
        store.add(articleList, function(err) {  // Storing all the articles to a JSON file
        	if (err){
                return callback({"success" : false, "message" : "Error storing JSON after article fetch from News API."})
            }

            return callback({"success" : true})
        })
    })
}


module.exports = fetchAll