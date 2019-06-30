<<<<<<< HEAD
const tagNumbersSentences = require('./numericalAnalysis.js')

function annotate(store, category, callback) {

	store.load(category, function (err, articleObj) {
		if (err) {
			return callback({ "success": false, "message": "(" + category + ") Error when reading JSON during annotating." })
		}

		// todo get text here and pass it 
		articleObj.articles.forEach(article => {
			// console.log(tagNumbersSentences(article.text))


			article.text = tagNumbersSentences(article.text)

			// console.log(tagNumbersSentences(article.text))

		})


		// todo specify how this should be added back in
		store.add(articleObj, function (err) {
			if (err) {
				return callback({ "success": false, "message": "(" + category + ") Error storing JSON after annotating." })
			}
			
		})

		return callback({ "success": true })
	})
=======
async function annotate(store, category) {
	// TODO: This code
>>>>>>> d7a0427856dcba5c1d5615a230ca945d063455a2
}

module.exports = annotate