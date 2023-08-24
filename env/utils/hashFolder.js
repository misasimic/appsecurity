const fs = require('fs-extra')
const crypto = require('crypto')
const path = require('path')

async function processFolder (folderPath) {
    const folderData = {}

    const processFile = async (filePath) => {
        const fileData = await fs.readFile(filePath)
        return calculateHash(fileData)
    }

    const processDirectory = async (dirPath) => {
        const dirContents = await fs.readdir(dirPath)

        for (const item of dirContents) {
            const itemPath = path.join(dirPath, item)
            const stats = await fs.stat(itemPath)

            if (stats.isFile()) {
                folderData[item] = await processFile(itemPath)
            } else if (stats.isDirectory()) {
                folderData[item] = await processFolder(itemPath)
            }
        }

        return folderData
    }

    return await processDirectory(folderPath)
}

function calculateHash (Data) {
    const hash = crypto.createHash('sha256')
    hash.update(JSON.stringify(Data))
    return hash.digest('hex')
}

async function hashFolder (folderPath) {
    const folderData = await processFolder(folderPath)
    const folderHash = calculateHash(folderData)
    return folderHash
}

module.exports = { hashFolder }
