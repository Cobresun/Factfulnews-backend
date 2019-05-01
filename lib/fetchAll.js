const NewsAPI = require('newsapi');
const newsAPIKey = process.env.NEWS_API     // A file stored locally (or in Heroku) with the API key
const newsapi = new NewsAPI(newsAPIKey);

// Calls the NewsAPI and gets the articles
function fetchAll(store, callback){
    store.remove('all', function(err) {     // Empty the file
        // If (err) throw err // err if the file removal failed <- commented out because it didn't exist
    })

    newsapi.v2.topHeadlines({
        language: 'en',
        country: 'us'
    })
    .then(response => {
        const articleList = {
            id: 'all',  // Adding an id to the store for when we eventually add more categories
            articles: response.articles
        }
        store.add(articleList, function(err) {
            if (err){
                return callback({"success" : false, "message" : "Error storing JSON after article fetch from News API."})
            }
            return callback({"success" : true})
        })
    });
}


module.exports = fetchAll