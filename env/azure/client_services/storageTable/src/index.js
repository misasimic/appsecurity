const { TableServiceClient, TableClient, AzureNamedKeyCredential } = require('@azure/data-tables')

const tableName = 'tbl'
const endpoint = `https://${process.env.StorageAccountName}.table.core.windows.net`
const credentials = new AzureNamedKeyCredential(
    process.env.StorageAccountName,
    process.env.StorageAccountKey
)

const tableService = new TableServiceClient(
    endpoint,
    credentials
)

const t = tableService.createTable(tableName)

let client
async function getClient () {
    if (!client) {
        await t
        // Create a TableClient
        client = new TableClient(
            endpoint,
            tableName,
            credentials
        )
    }
    return client
}

function prepareRecord (entity) {
    if (!entity.data[entity.meta.keyField]) {
        throw new Error(entity.meta.keyField + ' ir required KeyFiled. Missing in data.')
    }
    return {
        partitionKey: entity.meta.collection,
        rowKey: entity.data[entity.meta.keyField],
        ...entity.data
    }
}

async function saveEntity (entity) {
    const result = { success: true }
    try {
        const client = await getClient()
        const record = prepareRecord(entity)
        result.data = await client.upsertEntity(record, 'Replace')
    } catch (err) {
        result.success = false
        result.msg = err.message
    }
    return result
}

async function getEntity (entity) {
    const result = { success: true }
    try {
        const client = await getClient()
        const record = prepareRecord(entity)
        result.data = await client.getEntity(record.partitionKey, record.rowKey)
    } catch (err) {
        result.success = false
        result.msg = err.message
    }
    return result
}

function prepareEntity (collection, keyField, data) {
    return {
        meta: {
            collection,
            keyField
        },
        data
    }
}

module.exports = {
    saveEntity,
    getEntity,
    prepareEntity,
    serviceMeta: {}
}
