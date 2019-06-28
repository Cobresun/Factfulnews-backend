const NewsAPI = require('newsapi');
const newsAPIKey = process.env.NEWS_API
const newsapi = new NewsAPI(newsAPIKey);

function fetchAll(store, category) {
    return new Promise((resolve, reject) => {
        // Empty the file
        store.remove(category, function(err) {
            // TODO: WTF is this finicky code
            // reject(err)
        })
    
        newsapi.v2.topHeadlines({
            language: 'en',
            country: 'us',
            category: category
        })
        .then(response => {
            let articleList = {
                id: category,
                articles: response.articles
            }
            store.add(articleList, function(err) {
                if (err){
                    reject(err)
                }
                resolve()
            })
        })
    })
}

module.exports = fetchAll