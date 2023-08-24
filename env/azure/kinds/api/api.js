const azure = require('../../index')
const { ApiManagementClient } = require('@azure/arm-apimanagement')

let cachedClient
async function getClient () {
    if (!cachedClient) {
        const subscriptionId = await azure.getSubscriptionId()
        const resourceGroupName = await azure.getResourceGroupName()

        const client = new ApiManagementClient(azure.credentials, subscriptionId)
        cachedClient = { client, resourceGroupName }
    }
    return cachedClient
}

let APIServiceCache
const APIService = {
    constructName: async function () {
        return (await azure.getSubscriptionHash()) + azure.env.settings.projectName + 'site'
    },
    get: async function () {
        const { client, resourceGroupName } = await getClient()
        const serviceName = await APIService.constructName()
        if (!APIServiceCache) {
            try {
                console.log('Checking API Management service ...')
                APIServiceCache = await client.apiManagementService.get(
                    resourceGroupName,
                    serviceName
                )
                console.log('API Management - OK')
            } catch (err) {
                if (err.statusCode === 404) {
                    const serviceParams = {
                        publisherEmail: 'admin@example.com',
                        publisherName: 'Admin',
                        location: azure.env.settings.location,
                        sku: {
                            name: 'Developer',
                            capacity: 1
                        }
                    }
                    console.log('Creating API Management Service ... - It will take some time')
                    APIServiceCache = await client.apiManagementService.beginCreateOrUpdateAndWait(
                        resourceGroupName,
                        serviceName,
                        serviceParams
                    )
                    console.log('API Management service created successfully:')
                }
                throw err
            }
        }
        // console.log(APIServiceCache)

        return APIServiceCache
    }
}

const APIServiceAPI = {
    get: async function (in_meta) {
        const in_name = in_meta.name
        const APISvc = await APIService.get()
        const { client, resourceGroupName } = await getClient()

        const parameters = {
            description: `Link to '${in_name}' azure function app`,
            displayName: in_name,
            path: in_meta.api?.route || 'services/' + in_name,
            protocols: ['https'],
            subscriptionRequired: false
        }
        // console.log(parameters);
        const api = await client.api.beginCreateOrUpdateAndWait(resourceGroupName, APISvc.name, in_name, parameters)
        return api
    }
}

const APIServiceBackend = {
    get: async function (meta) {
        const APISvc = await APIService.get()
        const { client, resourceGroupName } = await getClient()
        let api
        try {
            api = await client.backend.get(resourceGroupName, APISvc.name, meta.name)
            return api
        } catch (err) {
            if (err.statusCode === 404) {
                const parameters = {
                    description: `Link to '${meta.name}' azure function app`,
                    resourceId: 'https://management.azure.com' + meta.fnAppId,
                    url: 'https://' + meta.fnAppName.toLowerCase() + meta.domain + '/api',
                    protocol: 'http',
                    credentials: {
                        header: {
                            'x-functions-key': [
                                meta.fnKey
                            ]
                        }
                    }
                }

                api = await client.backend.createOrUpdate(resourceGroupName, APISvc.name, meta.name, parameters)
                return api
            }
            throw err
        }
    }
}

const APIOperation = {
    create: async function (meta, version, post, subpath) {
        const APISvc = await APIService.get()
        const { client, resourceGroupName } = await getClient()
        function getPolicy () {
            let policy = ''
            if (version) {
                policy = '<rewrite-uri template="/version" copy-unmatched-params="true" />'
            } else {
                policy = `<rewrite-uri template="/${meta.name + (subpath ? '/{path}' : '')}" copy-unmatched-params="true" />`
            }
            return policy
        }
        const opId = version ? 'version' : meta.name + (subpath ? '-subpath' : '')
        const parameters = {
            name: (post ? 'post' : 'get') + '-' + opId,
            method: post ? 'POST' : 'GET',
            displayName: opId,
            urlTemplate: (version ? '/version' : '/' + (subpath ? '{*path}' : '')),
            policies: `
            <policies>
    <inbound>
        <base />
        <set-backend-service backend-id="${meta.name}" />
        <set-header name="x-original-host" exists-action="override">
        <value>@(context.Request.OriginalUrl.Host.ToString())</value>
    </set-header>
        ${getPolicy()}
    </inbound>
</policies>
            `
        }
        if (subpath) {
            parameters.templateParameters = [{
                name: 'path',
                type: 'string',
                required: false
            }]
        }
        const op = await client.apiOperation.createOrUpdate(resourceGroupName, APISvc.name, meta.name, parameters.name, parameters)

        await client.apiOperationPolicy.createOrUpdate(
            resourceGroupName,
            APISvc.name,
            meta.name,
            op.name,
            'policy',
            {
                format: 'xml',
                value: parameters.policies
            }
        )
        // console.log(policy)
        return op
    }
}

async function registerServiceApp (meta) {
    await APIService.get()
    await Promise.all([APIServiceBackend.get(meta), APIServiceAPI.get(meta)])
    console.log(meta.name + ' - Updating Routes')
    await Promise.all([
        APIOperation.create(meta),
        APIOperation.create(meta, false, false, true),
        APIOperation.create(meta, false, true),
        APIOperation.create(meta, false, true, true),
        APIOperation.create(meta, true)
    ])
    console.log(meta.name + ' - Routes updated successfully')
}

module.exports = {
    registerServiceApp
}
