const Sentiment = require('sentiment')
const sentiment = new Sentiment()

function getSentiment(text) {
	const result = sentiment.analyze(text)

	if (result.score > 0){
		return "Positive"
	} else if (result.score < 0){
		return "Negative"
	} else {
		return "Neutral"
	}
}

module.exports = getSentiment
