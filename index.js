var express = require('express')
var mysql = require('mysql')
var myConnection = require('express-myconnection')
/**
 * Express Validator Middleware for Form Validation
 */
var expressValidator = require('express-validator')
/**
 * body-parser module is used to read HTTP POST data
 * it's an express middleware that reads form's input 
 * and store it as javascript object
 */
var bodyParser = require('body-parser')
/**
 * This module let us use HTTP verbs such as PUT or DELETE 
 * in places where they are not supported
 */
var methodOverride = require('method-override')
/**
 * This module shows flash messages
 * generally used to show success or error messages
 * 
 * Flash messages are stored in session
 * So, we also have to install and use 
 * cookie-parser & session modules
 */
var flash = require('express-flash')
var cookieParser = require('cookie-parser');
var session = require('express-session');
const log4js = require('log4js');

log4js.configure({
    appenders: { cheese: { type: 'file', filename: 'logs/crud.log' } },
    categories: { default: { appenders: ['cheese'], level: 'info' } }
});
const LOGGER = log4js.getLogger(__filename);

var config = require('./config')
var index = require('./routes/index')
var users = require('./routes/users')

var app = express()
var dbConfig = {
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    port: config.database.port,
    database: config.database.db
}

/**
 * First arg - mysql module object
 * Scond arg - DB configuration
 * Third arg - 3 strategies can be used
 * 
 * single: Creates single database connection which is never closed.
 * pool: Creates pool of connections. Connection is auto release when response ends.
 * request: Creates new connection per new request. Connection is auto close when response ends.
 */
app.use(myConnection(mysql, dbConfig, 'pool'))
app.use(expressValidator())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
/**
 * using custom logic to override method
 * 
 * there are other ways of overriding as well
 * like using header & using query value
 */
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}))
app.use(cookieParser('nodejs CRUD using MYSQL'))
app.use(session({
    secret: 'nodejs CRUD using MYSQL',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
app.use(flash())
app.use(log4js.connectLogger(LOGGER, { level: 'info' }));
/**
 * setting up the templating view engine
 */
app.set('view engine', 'ejs')

app.use('/', index)
app.use('/users', users)

var port = config.server.port;
var host = config.server.host;
app.listen(port, host, function () {
    LOGGER.info('Server running at port ' + port + ': http://' + host + ':' + port)
})

process.addListener('uncaughtException', function (err, stack) {
    LOGGER.error('------------------------');
    LOGGER.error('Exception: ' + err);
    LOGGER.error(err.stack);
    LOGGER.error('------------------------');
});