module.exports = async function (context, req) {
    try {
        const build = require('../../build.json')
        context.res = {
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(build)
        }
    } catch (err) {
        context.res = {
            body: '{"error": "' + err.message + '"}'
        }
    }
    context.done()
}
