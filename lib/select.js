// Determines the top articles to give to the user
function selectArticles(store){
    let result = [];  

    store.load('all', function(err, articleObj){    // Read from the JSON file
        if (err) {
            sendResponse(false, undefined, "Error when reading JSON.", res);
        }

        // Retrieve only the specified max number of articles
        let articleList = articleObj.articles.slice(0, MAX_ARTICLES);
        
        articleIndex = 0;
        articleList.forEach(article => {
            // Discards 'broken' articles
            // TODO THIS CHANGES THE MAXNUMBER OF ARTICLES, NEED TO FIX THIS
            if (article.content != null && article.description != null){
                // Only send these elements to frontend, we don't need the rest of the article's details yet
                result.push({title:article.title, urlToImage:article.urlToImage, snippet:article.content, index:articleIndex, url:article.url});
                articleIndex++;
            }
        });

        // Placing the articles into the store
        store.add({id: 'all', articles: result}, function(err) {
            if (err) throw err;
        });

    });
}
