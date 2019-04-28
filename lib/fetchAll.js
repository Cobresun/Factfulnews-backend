const newsAPIKey = process.env.NEWS_API;     // A file stored locally (or in Heroku) with the API key
const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${newsAPIKey}`;


// Calls the NewsAPI and gets the articles
function fetchAll(store){
    store.remove('all', function(err) {     // Empty the file
        // If (err) throw err; // err if the file removal failed <- commented out because it didn't exist
    });
    request(url, function(error, response, body){
    	if (error) {
            console.log('error:', error); // Print the error if one occurred
        }
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        const bod = JSON.parse(body);   // Get the JSON sent to us from NEWS API
        let articles = bod.articles 
        let articleList = {
            id: 'all',  // Adding an id to the store for when we eventually add more categories
            articles: articles, 
        };
        store.add(articleList, function(err) {  // Storing all the articles to a JSON file
        	if (err) throw err;
        });
    });
}


module.exports = fetchAll