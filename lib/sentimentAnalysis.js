const Sentiment = require('sentiment')
const sentiment = new Sentiment()

function getSentiment(text) {
	const result = sentiment.analyze(text)

	if (result.comparative > 0.08){
		return "Positive"
	} else if (result.comparative < -0.08){
		return "Negative"
	} else {
		return "Neutral"
	}
}

module.exports = getSentiment
