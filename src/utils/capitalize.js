const capitalizeWords = (string) => {
    return string.replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())
}

const capitalizeUserArray = (users) => {
    return users.map(user => ({
        ...user,
        username: capitalizeWords(user.username)
    }))
}

module.exports = {
    capitalizeWords,
    capitalizeUserArray
}