let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');

let mongoDataProvider = require('./mongo-dataprovider')
let filesApi = require('./files-api')
let playlistsApi = require('./playlists-api')
let libraryApiMongo = require('./library-api-mongo')
let favoritesApi = require('./favorites-api')
let adminApi = require('./admin-api')
let loginApi = require('./login/login-api')
let loginMiddleware = require('./login/login-middleware')

let config = {
    port: process.env.PORT || 5000,
    mongoConnectionString: process.env.MONGO_URL ?? 'mongodb://admin:password@localhost:27017/sound9?authSource=admin',
    secretJwtKey: process.env.SECRET_JWT_KEY ?? `${Math.random().toString(16)}--${Math.random().toString(16)}`,
    adminWalletAddress: process.env.ADMIN_WALLET_ADDRESS,
    cookieTimeout: process.env.COOKIE_TIMEOUT ?? 30*24*60*60*1000
}

if(!config.adminWalletAddress){
    console.log('ENV variable for ADMIN_WALLET_ADDRESS is not set... Aborting...')
    return process.exit(1)
}

let start = async () => {
    // middleware loaded first is executed first
    app.use('/', express.static('./../frontend/dist'))

    // middlewares
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(loginMiddleware(config))

    // Infrastructure
    await mongoDataProvider.register(app, config)

    // Register api's
    loginApi.register(app, config, mongoDataProvider)
    playlistsApi.register(app, mongoDataProvider, config)
    filesApi.register(app, mongoDataProvider)
    libraryApiMongo.register(app, mongoDataProvider, config)
    favoritesApi.register(app, mongoDataProvider)
    adminApi.register(app, mongoDataProvider)

    // Dealing with uncaught exceptions instead of crashing the app
    process.on('uncaughtException', (error)  => {
        console.log(error);
    })
    process.on('unhandledRejection', (error, promise) => {
        console.log('unhandledRejection', error);
    });

    console.log('API on: http://localhost:' + config.port)
    app.listen(config.port)
}


start().then(x => {

}).catch(ex => {
    console.log(ex)
})

