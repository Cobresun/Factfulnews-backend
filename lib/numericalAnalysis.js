

const sentenceWithNumberRegex = /(((?!\.).)+|\.)\b(\d+)\b(((?!\.).)+|\.)/g
const forbiddensymbolRegex = /\.|,|\//g


function tagNumbersSentences(text){
    // todo
    // The goal here is to be able to read all sentences more precisely and then parse each sentence for presence of valid numbers more precisely.
    //getValidNumberSentences(getNumberSentences(getSentences(text)))
    
    // TODO HOW TO ANOTATE THE ORIGINAL TEXT FROM THE SENTENCES???
    //

    text.replace(sentenceWithNumberRegex , annotatedSentence("$&"))
}

function genQuery(query) {
    return encodeURI(query.replace(forbiddensymbolRegex, ""))
}

function annotatedSentence(sentence) {
   return "<mark><a href=\"https://www.google.com/search?q=" + genQuery("sentence") + "\">" + sentence + "</a></mark>"
}

function getSentences(text) {
    //todo
}

function getNumberSentences(sentences) {
    //todo
}

function getValidNumberSentences(sentences) {
    //todo
}

module.exports = tagNumbersSentences