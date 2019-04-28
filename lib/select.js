const { MAX_ARTICLES } = require("../config.json");

// Determines the top articles to give to the user
function selectArticles(store){
    let result = [];  

    store.load('all', function(err, articleObj){    // Read from the JSON file
        if (err) {
            sendResponse(false, undefined, "Error when reading JSON.", res)
        }

        let i = 0
        let articleIndex = 0

        while (articleIndex < MAX_ARTICLES && i < articleObj.length) {
            let article = articleObj.articles[i]

            if (article.content != null && article.description != null){
                // Only send these elements to frontend, we don't need the rest of the article's details yet
                result.push({title:article.title, urlToImage:article.urlToImage, snippet:article.content, index:articleIndex, url:article.url})
                articleIndex++
            }

            i++
        }

        // Placing the articles into the store
        store.add({id: 'all', articles: result}, function(err) {
            if (err) throw err
        });

    });
}

module.exports = selectArticles