const tagNumbersSentences = require('./numericalAnalysis.js')

function annotate(store, callback) {

	store.load(category, function (err, articleObj) {
		if (err) {
			return callback({ "success": false, "message": "(" + category + ") Error when reading JSON during annotating." })
		}

		// todo get text here and pass it 
		//const res = tagNumbersSentences( )

		// todo specify how this should be added back in
		store.add({ id: category, articles: result }, function (err) {
			if (err) {
				return callback({ "success": false, "message": "(" + category + ") Error storing JSON after annotating." })
			}
			
		})

		return callback({ "success": true })
	})
}

module.exports = annotate