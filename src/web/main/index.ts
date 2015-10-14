import * as http from 'http';
import * as express from 'express';
import * as expressSession from 'express-session';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
// import * as expressMinify from 'express-minify';
const expressMinify: any = require('express-minify');

const config: any = require('../config');

console.log('Web server loaded');

// Grobal options
const sessionExpires = 1000 * 60 * 60 * 24 * 365;
const htmlpretty = '  ';

// Init server
const server: express.Express = express();
server.locals.compileDebug = false;
server.locals.pretty = htmlpretty;
server.set('view engine', 'jade');
server.set('views', `${__dirname}/views/pages`);
server.set('X-Frame-Options', 'SAMEORIGIN');

server.use(bodyParser.urlencoded({ extended: true }));
server.use(cookieParser(config.cookiePass));

// Session settings
server.use(expressSession({
	name: config.sessionKey,
	secret: config.sessionSecret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		path: '/',
		domain: ".#{config.public-config.domain}",
		httpOnly: false,
		secure: false,
		expires: new Date(Date.now() + sessionExpires),
		maxAge: sessionExpires,
	}
}));
cookie:




store: new RedisStore do
	db: 1
		prefix: 'misskey-session:'

function initSession(req, res, callback) {
	var uas = req.headers['user-agent'];
	if (uas != null) {
		ua = uas.to - lower -case!
		is - mobile = /(iphone|ipod|ipad|android.*mobile|windows.*phone|psp|vita|nitro|nintendo)/i.test ua
		req.is - mobile = !!is - mobile
	}
	else {
		ua = null
		is - mobile = no
		req.is - mobile = no
	}
	req.login = req.session ? && req.session.user - id ?
		req.data = # Render datas
	page - path: req.path
	config: config.public - config
	url: config.public - config.url
	api - url: config.public - config.api - url
	web - streaming - url: config.public - config.web - streaming - url
	login: req.login
	is - mobile: req.is - mobile
	moment: moment

	# Renderer function
		res.display = (req, res, name, render - data) -> res.render name, req.data << <render-data

	# Check logged in, set user instance
	if req.login
		user- id = req.session.user - id
	User.find - by - id user- id, (, user) ->
	req
		..data.me = user
			..me = user
	callback!
	else
	req
		..data.me = null
			..me = null
	callback!
	}

# Statics
server.get '/favicon.ico' (req, res) -> res.send - file path.resolve "#__dirname/resources/favicon.ico"
server.get '/manifest.json' (req, res) -> res.send - file path.resolve "#__dirname/resources/manifest.json"

# Init session
server.all '*' (req, res, next) ->
server.init - session req, res, ->
		if req.is - mobile
			server.set 'views' "#__dirname/sites/mobile/views/pages"
		else
server.set 'views' "#__dirname/sites/desktop/views/pages"
next!

# Resources rooting
resources - router server

# General rooting
router server

# Not found handling
server.use(req, res) ->
res
	..status 404
		..display req, res, 'not-found' {}

# Error handling
server.use(err, req, res, next) ->
console.error err
display - err = "#{err.stack}\r\n#{repeat 32 '-'}\r\n#{req.method} #{req.url} [#{new Date!}]"
if (req.has - own - property \login) && req.login
display - err += "\r\n#{req.me?id ? ''}"
res.status 500
if res.has - own - property \display
res.display req, res, \error {err: display - err }
	else
res.send err

exports.server = server
