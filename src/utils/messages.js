const generateMessage = (username, text) => ({
    username,
    text,
    createdAt: new Date().getTime()
})

const generateLocationMessage = (username, city, state, url) => ({
    username,
    city,
    state,
    url,
    createdAt: new Date().getTime(),
})

module.exports = {
    generateMessage,
    generateLocationMessage
}