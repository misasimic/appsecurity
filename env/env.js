const settings = require('./settings.json')
const fs = require('fs-extra')
const path = require('path')

settings.projectName = settings.projectName || 'SecureAppDemo'
settings.location = settings.location || 'westus'

function getCloudProvider () {
    if (!settings.cloud_provider) {
        settings.cloud_provider = require(`./${settings.provider}/index.js`)
    }
    return settings.cloud_provider
}

async function getServices () {
    const servicesFolder = path.resolve(__dirname, '../services')
    const folders = (await fs.readdir(servicesFolder)).filter(e => e !== 'shared' && e.indexOf('.') < 0)

    const services = {}

    folders.forEach(f => {
        try {
            const serviceFolder = path.join(servicesFolder, f)
            const meta = require(path.join(serviceFolder, 'service.json'))
            meta.name = f
            meta.src_folder = serviceFolder
            services[f] = meta
        } catch (err) {
            console.log(`service '${f}' does not have service.json meta file`)
        }
    })

    return services
}

function getCloudClient () {
    const filePath = path.resolve(__dirname, settings.provider, 'cloud_client.js')
    return require(filePath)
}

module.exports = {
    settings,
    getCloudProvider,
    getServices,
    getCloudClient
}
