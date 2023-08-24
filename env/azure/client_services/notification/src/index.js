const cloud_client = require('../../../cloud_client.js')
const sgMail = require('@sendgrid/mail')
let msg

async function loadSendGird () {
    if (!msg) {
        const secrets = await cloud_client.get_cloud_service('secrets')
        const rawSecret = await secrets.getSecret('SENDGRID')
        if (!rawSecret) {
            throw new Error('Please set the SENDGRID secret')
        }
        const sg = JSON.parse(rawSecret)
        sgMail.setApiKey(sg.key)
        msg = {
            from: sg.sender
        }
    }
}

async function sendMail (in_msg) {
    const res = {
        success: true
    }
    try {
        await loadSendGird()
        Object.assign(in_msg, msg)
        res.data = sgMail.send(in_msg)
    } catch (err) {
        res.msg = err.message
        res.success = false
    }
    return res
}

module.exports = {
    sendMail
}
