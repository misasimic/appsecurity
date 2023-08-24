const env = require('./env/env')

async function deployServices () {
    const cloud = env.getCloudProvider()
    cloud.deployServices()
}

deployServices()
