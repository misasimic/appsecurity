async function process_http_req (req) {
    let res = {
        body: JSON.stringify({
            success: false,
            message: 'Invalid request'
        })
    }

    try {
        const route = req.params?.path || ''
        const router = require('./routes/' + route + '_' + req.method)
        res = await router.handler(req)
    } catch (err) {
        res = {
            body: JSON.stringify({
                success: false,
                message: 'Invalid request',
                msg: err.message
            })
        }
    }

    if (typeof req.query?.d !== 'undefined') {
        const t = {
            res,
            req
        }
        res = {
            headers: {
                'content-type': 'application/json'
            },
            body: customStringify(t)
        }
    }
    return res
}

module.exports = {
    process_http_req
}

function customStringify (obj, replacer = null, space = 4) {
    const seen = new WeakSet() // To keep track of seen objects

    return JSON.stringify(obj, function (key, value) {
        if (replacer) {
            value = replacer.call(this, key, value)
        }

        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular Reference]'
            }
            seen.add(value)
        }

        return value
    }, space)
}
