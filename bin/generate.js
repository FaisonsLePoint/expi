
import chalk from 'chalk'
import logSymbols from 'log-symbols'
import figlet from 'figlet'
import boxen from 'boxen'
import path from 'path'
import fs from 'fs-extra'
import ora from 'ora'
import inquirer from 'inquirer'
import { spawn } from 'child_process'

import pkg from 'template-file'
const { renderFile } = pkg


const params = process.argv.slice(2)
const startTime = new Date().getTime()
let details = {}

if (params.length === 0) {
    console.log(logSymbols.error, chalk.red('Invalid args...'))
    console.log(chalk.blue('Quick start...'))
    console.group()
    console.log(chalk.green('expi .'))
    console.log(`Installs in current directory (${process.cwd()})`)

    console.log('\nOR\n')
    console.log(chalk.green('expi myApp'))
    console.log(
        `Installs in "myApp" directory (${path.join(process.cwd(), 'myApp')})`
    )
    console.groupEnd()
    process.exit(1)
}

const rootDir = path.join(process.cwd(), params[0])

const questions = [
    {
        type: 'list',
        name: 'first',
        message: 'What do you want to generate ?',
        choices: [
            'Simple API',
            'Add resources'
        ]
    },
    {
        type: 'input',
        name: 'resources',
        message: 'Write here your resources separate by coma',
        when(answers) {
            if (answers.first == 'Simple API') {
                return false
            }
            return answers.first
        }
    },
    {
        type: 'confirm',
        name: 'auth',
        message: 'Do you want JWT authentication ?',
        default() {
            return false
        }
    }
]

inquirer.prompt(questions)
    .then(async answers => {
        console.log(answers)

        details = answers
        startApp()
    })

const startApp = () => {
    figlet('Expi', { font: 'Slant Relief' }, (err, data) => {
        if (err) {
            console.log('Something went wrong...')
            console.log(err)
            return
        }
        console.log(chalk.green(data))
        const channelLink = 'https://www.youtube.com/@FaisonsLePoint'
        const githubLink = 'https://github.com/FaisonsLePoint'
        const youtube = `${chalk.white('📺 Visit @')} ${chalk.red(channelLink)}`
        const github = `${chalk.white('📦 Github @')} ${chalk.blue(githubLink)}`
        const header = `${youtube}\n${github}`
        console.log(
            boxen(header, {
                borderColor: 'yellow',
                borderStyle: 'classic',
                align: 'left',
            })
        )

        createApp()

    })
}


const createApp = async () => {
    try {

        // If not exist's, create app folder //TODO VOIR AVEC FS-EXTRA
        if (!(await fs.pathExists(rootDir))) {
            await fs.mkdir(rootDir)
        }

        // Check if folder is empty
        const files = await fs.readdir(rootDir)
        if (files.length > 0) {
            console.log(
                logSymbols.error,
                `Path ${chalk.green(rootDir)} ${chalk.red('is not empty')}`
            )
            process.exit(1)
        }

        console.log('🚚 Generating Express API in', chalk.green(rootDir), '\n')

        await installScript(['init', '-y'], 'Creating Package.json')
        await installScript(['i', 'express', 'cors', 'dotenv'], 'Installing dependencies')
        await installScript(['i', '--save-dev', 'nodemon'], 'Installing dev dependencies')

        await modifyPJS('Add script to Package.json')

        if (details.hasOwnProperty('resources')) {

            if (!(await fs.pathExists(rootDir + '/controllers'))) {
                await fs.mkdir(rootDir + '/controllers')
                await fs.mkdir(rootDir + '/routers')
            }

            for (let res of details.resources.split(',')) {
                let name = res.trim() // TODO utili ici ?

                await generateResourceFile(name, 'controller')
                await generateResourceFile(name, 'router')

                await generateServerFile(details.resources)

            }
            
        } else {
            await generateServerFile()
        }

        await generateEnvFile()

        done()
    } catch (e) {
        // TODO FAIRE UN VRAI GESTIONNAIRE D'ERREUR        
        console.log('here')
        console.log(e)
    }
}

function done() {
    console.log(chalk.yellow('------------------------------------'))
    console.log('Begin by typing:')
    console.group()
    console.log(chalk.blue('cd'), params[0])
    console.log(chalk.blue('npm run dev'))
    console.group()
    console.log('starts the development server (using nodemon 🧐)')
    console.groupEnd()
    console.log(chalk.blue('npm start'))
    console.group()
    console.log(`starts the server (using node 😁)`)
    console.groupEnd()
    console.groupEnd()
    console.log(chalk.yellow('------------------------------------'))

    const endTime = new Date().getTime()
    const timeDifference = (endTime - startTime) / 1000
    console.log(`✅ Done in ${timeDifference} seconds ✨`)
    console.log('🌈 Happy hacking 🦄')
}


const installScript = (params, spinnerText) => {
    return new Promise((resolve, reject) => {
        const spinner = ora(spinnerText).start()

        const child = spawn('npm', params, { cwd: rootDir, shell: true })
        child.on('exit', (code, signal) => {
            //console.log(code, signal)
            if (code) {
                spinner.fail()
                reject(`Process exit with code: ${code}`)
            } else if (signal) {
                spinner.fail()
                reject(`Process exit with signal: ${signal}`)
            } else {
                spinner.succeed()
                resolve()
            }
        })
    })
}

const modifyPJS = (spinnerText) => {
    return new Promise(async (resolve, reject) => {
        const spinner = ora(spinnerText).start()

        try {
            // Get package.json file
            const pkgSrc = path.join(rootDir, 'package.json')
            const pkgfile = await fs.readFile(pkgSrc, { encoding: 'utf-8' })
            //console.log(typeof pkgfile)

            // Parse in object
            let packageJson = JSON.parse(pkgfile)
            //console.log(typeof packageJson)

            // Add script and license
            packageJson = {
                ...packageJson,
                main: 'server.js',
                scripts: {
                    start: 'node server.js',
                    dev: 'nodemon server.js',
                },
                license: 'MIT',
            }

            // Save modifications
            await fs.writeFile(pkgSrc, JSON.stringify(packageJson, null, 2))

            spinner.succeed()
            resolve()
        } catch (e) {
            spinner.fail()
            reject(e)
        }
    })
}

// TODO VOIR copyFile ou copyFileSync
const generateFiles = () => {
    return new Promise(async (resolve, reject) => {
        const spinner = ora('Generate API files').start()
        try {

            await fs.copyFile(
                path.join(rootDir, '..', 'templates', 'server.js'),
                path.join(rootDir, 'server.js')
            )

            await fs.copyFile(
                path.join(rootDir, '..', 'templates', '.env'),
                path.join(rootDir, '.env')
            )

            spinner.succeed()
            resolve()
        } catch (e) {
            spinner.fail()
            reject(e)
        }
    })
}


const generateResourceFile = (name, type) => {
    return new Promise(async (resolve, reject) => {
        let uName = name[0].toUpperCase() + name.slice(1)
        const spinner = ora(`Generate ${name} ${type}`).start()

        try {
            await fs.copyFile(
                path.join(rootDir, '..', 'templates', `${type}.tmp`),
                path.join(rootDir + `/${type}s`, `${name}.js`)
            )

            let sourceFile = path.join(rootDir + `/${type}s`, `${name}.js`)
            let render = await renderFile(
                path.join(rootDir + `/${type}s`, `${name}.js`),
                { name: name, uName: uName }
            )
            await fs.writeFile(sourceFile, render)

            spinner.succeed()
            resolve()
        } catch (e) {
            spinner.fail()
            reject(e)
        }
    })
}

const generateServerFile = (resources = null) => {
    return new Promise(async (resolve, reject) => {
        const spinner = ora('Genrate API Server').start()
        try {

            if (resources) {
                let data = { routers: [], routes: [] }

                for (let res of resources.split(',')) {
                    let name = res.trim()
                    data.routers.push({ module: `const ${name}_router = require('./routers/${name}')` })
                    data.routes.push({ route: `app.use('/${name}', ${name}_router)` })
                }

                await fs.copyFile(
                    path.join(rootDir, '..', 'templates', 'server.tmp'),
                    path.join(rootDir, `server.js`)
                )

                let sourceFile = path.join(rootDir, 'server.js')
                let render = await renderFile(
                    path.join(rootDir, 'server.js'),
                    data
                )
                await fs.writeFile(sourceFile, render)

            } else {
                await fs.copyFile(
                    path.join(rootDir, '..', 'templates', 'server.js'),
                    path.join(rootDir, 'server.js')
                )
            }

            spinner.succeed()
            resolve()

        } catch (e) {
            spinner.fail()
            reject(e)
        }
    })
}

const generateEnvFile = () => {
    return new Promise(async (resolve, reject) => {
        const spinner = ora('Generate .env file')
        try{
            await fs.copyFile(
                path.join(rootDir, '..', 'templates', '.env'),
                path.join(rootDir, '.env')
            )

            spinner.succeed()
            resolve()
        }catch(e){
            spinner.fail()
            reject(e)
        }        
    })
}

const generateResourceFileOld = async () => {
    //console.log(details.resources)



    if (!(await fs.pathExists(rootDir + '/controllers'))) {
        await fs.mkdir(rootDir + '/controllers')
        await fs.mkdir(rootDir + '/routers')
    }

    for (let res of details.resources.split(',')) {
        let name = res.trim()
        let uName = name[0].toUpperCase() + name.slice(1)

        let spinner = ora(`Generate ${name} Controller`).start()

        await fs.copyFile(
            path.join(rootDir, '..', 'templates', 'controller.tmp'),
            path.join(rootDir + '/controllers', `${name}.js`)
        )

        let pkgSrc = path.join(rootDir + '/controllers', `${name}.js`)
        let test = await renderFile(
            path.join(rootDir + '/controllers', `${name}.js`),
            { name: name, uName: uName }
        )
        await fs.writeFile(pkgSrc, test)

        spinner.succeed()

        //-------------------------------------

        spinner = ora(`Generate ${name} Router`).start()

        await fs.copyFile(
            path.join(rootDir, '..', 'templates', 'router.tmp'),
            path.join(rootDir + '/routers', `${name}.js`)
        )

        pkgSrc = path.join(rootDir + '/routers', `${name}.js`)
        test = await renderFile(
            path.join(rootDir + '/routers', `${name}.js`),
            { name: name, uName: uName }
        )
        await fs.writeFile(pkgSrc, test)

        spinner.succeed()

    }

    //------------------------------------

    let spinner = ora('Generate API server').start()

    // TODO voir si toLowercase quand même

    let data = { routers: [], routes: [] }

    for (let res of details.resources.split(',')) {
        let name = res.trim()

        data.routers.push({ module: `const ${name}_router = require('./routes/${name}')` })
        data.routes.push({ route: `app.use('/${name}', ${name}_router)` })
        console.log()

    }

    await fs.copyFile(
        path.join(rootDir, '..', 'templates', 'server.tmp.js'),
        path.join(rootDir, `server.js`)
    )

    let pkgSrc = path.join(rootDir, 'server.js')
    let test = await renderFile(
        path.join(rootDir, 'server.js'),
        data
    )
    await fs.writeFile(pkgSrc, test)

    spinner.succeed()


    process.exit(0)

}

