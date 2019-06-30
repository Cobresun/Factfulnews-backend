const {MAX_ARTICLES} = require("../config.json")

// Determines the top articles to give to the user
function selectArticles(store, category) {
    return new Promise((resolve, reject) => {
        store.load(category, function(err, articleObj) {
            if (err) {
                reject(err)
            }
    
            articleObj.articles.splice(MAX_ARTICLES)
    
            store.add(articleObj, function(err) {
                if (err) {
                    reject(err)
                }
                resolve()
            })
    
        })
    })
}

module.exports = selectArticles