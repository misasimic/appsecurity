require('dotenv').configDotenv()

async function getSecret (name) {
    return process.env[name]
}

module.exports = { getSecret }
