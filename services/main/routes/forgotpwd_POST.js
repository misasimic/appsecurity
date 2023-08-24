const response = require('./response')
const users = require('../security/users')
const querystring = require('querystring')

async function handler (req) {
    const user = await users.get_user(req.body)

    if (user.success) {
        const token = await users.getResetToken(req.body.email)
        const params = {
            token
        }
        const host = req.headers['x-original-host'] || req.headers.host + '/api/main'
        const url = `https://${host}/resetpwd?` + querystring.stringify(params)
        /*
        async function sendMail () {
            const cloud_client = require('../../cloud_client')
            const notify = await cloud_client.get_cloud_service('notification')
            notify.sendMail({
                to: req.body.email,
                html: `To reset your password, please visit the following link: <a href="${url}">Reset Password</a>`,
                subject: 'Password Reset'
            })
        }
        sendMail()
        */
        return response.applyJSONResponse({
            success: true,
            url,
            msg: 'email sent to ' + req.body.email
        })
    } else {
        return response.applyJSONResponse({
            success: false,
            msg: 'invalid user. Please sign up.'
        })
    }
}

module.exports = {
    handler
}

if (require.main === module) {
    handler({
        body: {
            email: 'dd'
        }
    })
}
