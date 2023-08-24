const response = require('./response')
const users = require('../security/users')
const cookie = require('cookie')
async function handler (req) {
    const res = {}
    const cookies = cookie.parse(req.headers?.cookie || '')
    const loginUrl = (req.headers['x-original-host'] ? '' : '/api/main') + '/login'
    if (cookies.jwt) {
        const result = await users.login_jwt(cookies.jwt)
        if (result.success) {
            const home = (await response.loadHTMLFile('home')).replace(/1111email1111/, result.user.email)

            response.applyHTMLResponse(home, res)
        } else {
            res.status = 302
            response.addHeader('Location', loginUrl, res)
        }
    } else {
        res.status = 302

        response.addHeader('Location', loginUrl, res)
    }
    return res
}

module.exports = {
    handler
}
