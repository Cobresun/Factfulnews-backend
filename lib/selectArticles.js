const {MAX_ARTICLES} = require("../config.json")

// Determines the top articles to give to the user
function selectArticles(store, category, callback){
    store.load(category, function(err, articleObj){
        if (err) {
            return callback({"success" : false, "message" : "(" + category + ") Error when reading JSON during selecting."})
        }

        articleObj.articles.splice(MAX_ARTICLES)

        // Placing the articles into the store
        store.add(articleObj, function(err) {
            if (err) {
                return callback({"success" : false, "message" : "(" + category + ") Error storing JSON after article selecting."})
            }
            return callback({"success" : true})
        })

    })
}

module.exports = selectArticles