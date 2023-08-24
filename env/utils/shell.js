const { spawn } = require('child_process')

function executeShell (cmdArr, cwd, print = false) {
    return new Promise(function (resolve, reject) {
        const command = cmdArr[0]
        const args = cmdArr.slice(1)

        const options = {
            cwd // Replace with the desired directory path
        }

        const rez = {
            data: [],
            errors: []
        }

        const childProcess = spawn(command, args, options)

        childProcess.stdout.on('data', (data) => {
            if (print) console.log(`${data}`)
            rez.data.push(data.toString())
        })

        childProcess.stderr.on('data', (data) => {
            if (print) console.error(`${data}`)
            rez.errors.push(data.toString())
        })

        childProcess.on('close', (code) => {
            rez.code = code
            resolve(rez)
        })
    })
}

async function executeCmd (cmd, cwd, print = false) {
    const cmdArr = cmd.split(' ').map(el => el.replace(/1111Space1111/g, ' '))
    cwd = cwd || process.cwd()
    return executeShell(cmdArr, cwd, print)
}

module.exports = {
    executeCmd
}
