const router = require('./http_router')

module.exports = async function (context, req) {
    try {
        context.res = await router.process_http_req(req)
    } catch (err) {
        context.res = {
            message: err.message,
            e: err
        }
    }

    context.done()
}
