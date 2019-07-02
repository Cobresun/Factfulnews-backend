const NewsAPI = require('newsapi')
const newsAPIKey = process.env.NEWS_API
const newsapi = new NewsAPI(newsAPIKey)

function fetchAll(store, category) {
    return new Promise((resolve, reject) => {
        // Empty the file -> readable() is basically a replacement for an exists() method
        if (store.readable){
            store.remove(category, function(err) {console.error(err)})
        }
        
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