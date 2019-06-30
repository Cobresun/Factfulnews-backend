

// const sentenceWithNumberRegex = /(((?!\.).)+|\.)\b(\d+)\b(((?!\.).)+|\.)/g
const sentenceRegex = /\b((?!\.).)+(.)\b/g
const forbiddensymbolRegex = /\.|,|\//g
const timeRegex = /(1[012]|[0-9]):[0-5][0-9]((p|a)m)?/g


function tagNumbersSentences(text){
    // The goal here is to be able to read all sentences more precisely and then parse each sentence for presence of valid numbers more precisely.
    // TODO proper error trapping? OR at least fix the error with esocket
    
    if (text) {
        const validSentences = getValidNumberSentences(getSentences(text))
        
        console.log(validSentences)

        validSentences.forEach(sentence => {
            text.replace(sentence, annotatedSentence(sentence))
        })
        
    }
    else {
        console.log("failed.")
    }
    return text
}

function genQuery(query) {
    return encodeURI(query.replace(forbiddensymbolRegex, ""))
}

function annotatedSentence(sentence) {
    // how to alter replaced text when we can't see it until after replacement
    return "<mark><a href=\"https://www.google.com/search?q=" + genQuery(sentence) + "\">" + sentence + "</a></mark>"
}

function getSentences(text) {
    return text.match(sentenceRegex)
}

function getValidNumberSentences(sentences) {
    // TODO can also filter out any suspected non sentences here maybe?
    const numberSentences = []

    sentences.forEach(sentence => {
        if (isValidNumber)
            numberSentences.push(sentence)
    });

    return numberSentences
}


function isValidNumber(text) {
    return time.match(/[[:digit:]]/g) && !text.match(timeRegex)
}

module.exports = tagNumbersSentences