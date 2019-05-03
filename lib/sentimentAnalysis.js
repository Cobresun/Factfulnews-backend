const {SENTIMENT_THRESHOLD} = require("../config.json")
const Sentiment = require('sentiment')
const sentiment = new Sentiment()

function getSentiment(text) {
	const result = sentiment.analyze(text)

	if (result.comparative > SENTIMENT_THRESHOLD){
		return "Positive"
	} else if (result.comparative < -SENTIMENT_THRESHOLD){
		return "Negative"
	} else {
		return "Neutral"
	}
}

module.exports = getSentiment
