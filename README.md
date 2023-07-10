```bash
   __/\\\\\\\\\\\\\\\___________________________________        
 _\/\\\///////////____________________________________       
  _\/\\\_____________________________/\\\\\\\\\___/\\\_      
   _\/\\\\\\\\\\\______/\\\____/\\\__/\\\/////\\\_\///__     
    _\/\\\///////______\///\\\/\\\/__\/\\\\\\\\\\___/\\\_    
     _\/\\\_______________\///\\\/____\/\\\//////___\/\\\_   
      _\/\\\________________/\\\/\\\___\/\\\_________\/\\\_  
       _\/\\\\\\\\\\\\\\\__/\\\/\///\\\_\/\\\_________\/\\\_ 
        _\///////////////__\///____\///__\///__________\///__
```

# Express API RESTFull Scaffolding (expi)

This is just a Express.js API RESTFull generator, which is can be used as a starting point for any express application.

This project is based on the excellent idea of [TrulyMittal](https://github.com/trulymittal)<br>
But with some additions ;)

## Installation 🏭

```bash
$ npm install -g flp-expi
```

## Quick Start 🏃‍♂️

The quickest way to get started is to utilize the executable `expi` to generate an application as shown below:

Create (and start) the app in current folder:

```bash
$ expi .
$ npm run dev
```

OR, create (and start) the app (in `myApp` folder):

```bash
$ expi myApp
$ cd myApp
$ npm run dev
```

This will basically create this structure in your folder if you choose 'Simple API'

```bash
.
├── node_modules
├── .env
├── package-lock.json
├── package.json
└── server.js    
```

This is how easy it is to get going.

If you choose specifics resources

```bash
.
└── controllers
    └── ... .js
    └── ... .js
├── node_modules
├── routers
|   └── ... .js
|   └── ... .js
├── .env
├── package-lock.json
├── package.json
└── server.js
```

## A picture is worth a thousand words.

<p align='center'>
Not provide now
</p>

## What dependencies it installs ?

- **express** - express framework
- **dotenv** - for env variables
- **cors** - for CORS Policy
- **nodemon** (dev) - monitors changes in files

## YouTube 📺

https://www.youtube.com/@FaisonsLePoint

## License 🎫

[MIT](LICENSE)
