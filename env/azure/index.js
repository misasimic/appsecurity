const path = require('path')
const subscriptions = require('./subscriptions')
const env = require('../env')
const { DefaultAzureCredential } = require('@azure/identity')

async function deployServices () {
    const services = await env.getServices()
    // console.log(services);

    const deployers = Object.values(services).map(service => {
        const deployerModule = require(path.join(__dirname, 'kinds', service.kind, service.kind))
        return deployerModule.deployer(service)
    })
    await Promise.all(deployers.map(deployer => deployer()))
    const hash = await module.exports.getSubscriptionHash()
    console.log(`https://${hash + env.settings.projectName.toLowerCase()}site.azure-api.net`)
}

async function getSubscriptionId () {
    const acc = await subscriptions.loadAccount()
    return acc.id
}

module.exports = {
    deployServices,
    credentials: new DefaultAzureCredential(),
    getSubscriptionId,
    getAccount: subscriptions.loadAccount,
    getSubscriptionHash: async function () {
        const subscriptionId = await getSubscriptionId()
        return subscriptionId.split('-')[3]
    },
    getResourceGroupName: function () {
        const resourceGroup = require('./resourceGroups')
        return resourceGroup.getResourceGroupName()
    },
    env
}

if (require.main === module) {
    deployServices()
}
