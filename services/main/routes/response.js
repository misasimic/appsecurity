const cookie = require('cookie')
const fs = require('fs-extra')
const path = require('path')
function applyJSONResponse (data, res) {
    res = addHeader('Content-Type', 'text/json', res)
    res.body = JSON.stringify(data)
    return res
}

function applyHTMLResponse (data, res) {
    res = addHeader('Content-Type', 'text/html', res)
    res.body = data
    return res
}
function addHeader (name, value, res) {
    res = res || {}
    res.headers = res.headers || {}
    res.headers[name] = value
    return res
}
function applyCookie (name, value, res) {
    res = res || {}
    const cookieOptions = {
        maxAge: 60 * 60 * 24 * 7, // cookie expiration time in seconds
        httpOnly: true, // cookie accessible only through HTTP
        secure: true, // cookie only sent over HTTPS
        sameSite: 'strict' // restrict cookie to same-site requests
    }
    const newCookieString = cookie.serialize(name, value, cookieOptions)
    addHeader('Set-Cookie', newCookieString, res)
    return res
}

async function loadHTMLFile (filename) {
    return fs.readFile(path.resolve(__dirname, '../html', filename + '.html'), 'utf8')
}

module.exports = {
    applyCookie,
    applyHTMLResponse,
    applyJSONResponse,
    addHeader,
    loadHTMLFile
}
