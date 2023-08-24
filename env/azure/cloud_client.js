const fs = require('fs')
const path = require('path')

let settings
function getSettings () {
    if (!settings) {
        let settingsFile = path.resolve(__dirname, 'settings.json')

        if (!fs.existsSync(settingsFile)) {
            settingsFile = path.resolve(__dirname, '../', 'settings.json')
        }
        settings = require(settingsFile)
    }
    return settings
}

async function get_cloud_service (name) {
    const settings = getSettings()
    const client_svc_name = settings[settings.provider].client[name]
    if (!client_svc_name) {
        throw new Error(`Cloud Provider, '${settings.provider}', does not have setup for cloud_service: ${name}`)
    }
    const svc_file = path.join(__dirname, 'client_services', client_svc_name, 'src/index.js')

    return require(svc_file)
}

module.exports = {
    get_cloud_service
}
