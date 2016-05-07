//////////////////////////////////////////////////
// CONFIGURATION MANAGER
//////////////////////////////////////////////////

import * as fs from 'fs';
import * as yaml from 'js-yaml';

// Detect home path
const home = process.env[
	process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];

// Name of directory that includes config file
const dirName = '.misskey-web';

// Name of config file
const fileName = 'config.yml';

// Resolve paths...
const dirPath = `${home}/${dirName}`;
const path = `${dirPath}/${fileName}`;

//////////////////////////////////////////////////
// CONFIGURATION LOADER

function loadConfig(): IConfig {
	let conf: IConfig;

	try {
		// Load and parse the config
		conf = <IConfig>yaml.safeLoad(fs.readFileSync(path, 'utf8'));
		console.log('Loaded config');
	} catch (e) {
		console.error('Failed to load config: ' + e);
		process.exit(1);
	}

	validateHost(conf.host);

	const host = conf.host;
	const domains = conf.domains;

	const scheme = conf.https.enable ? 'https' : 'http';
	const port = conf.https.enable
		? conf.port.https === 443 ? '' : ':' + conf.port.https
		: conf.port.http === 80 ? '' : ':' + conf.port.http;

	conf.url = `${scheme}://${host}` + port;

	// Define hosts
	conf.hosts = {
		admin: `${domains.admin}.${host}`,
		i: `${domains.i}.${host}`,
		about: `${scheme}${domains.about}.${host}`,
		api: `${domains.api}.${host}`,
		webApi: `${domains.webApi}.${host}`,
		resources: `${domains.resources}.${host}`,
		signup: `${domains.signup}.${host}`,
		signin: `${domains.signin}.${host}`,
		signout: `${domains.signout}.${host}`,
		share: `${domains.share}.${host}`,
		forum: `${domains.forum}.${host}`,
		search: `${domains.search}.${host}`,
		talk: `${domains.talk}.${host}`,
		help: `${domains.help}.${host}`,
		color: `${domains.color}.${host}`
	};

	// Define URLs
	conf.urls = {
		admin: `${scheme}${domains.admin}.${host}`,
		i: `${scheme}${domains.i}.${host}`,
		about: `${scheme}${domains.about}.${host}`,
		api: `${scheme}${domains.api}.${host}`,
		webApi: `${scheme}${domains.webApi}.${host}`,
		resources: `${scheme}${domains.resources}.${host}`,
		signup: `${scheme}${domains.signup}.${host}`,
		signin: `${scheme}${domains.signin}.${host}`,
		signout: `${scheme}${domains.signout}.${host}`,
		share: `${scheme}${domains.share}.${host}`,
		forum: `${scheme}${domains.forum}.${host}`,
		search: `${scheme}${domains.search}.${host}`,
		talk: `${scheme}${domains.talk}.${host}`,
		help: `${scheme}${domains.help}.${host}`,
		color: `${scheme}${domains.color}.${host}`
	};

	return conf;
}

export default loadConfig();

//////////////////////////////////////////////////
// CONFIGURATION INTERFACE DEFINITION

type Domains = {
	about: string;
	admin: string;
	api: string;
	color: string;
	forum: string;
	help: string;
	i: string;
	resources: string;
	signup: string;
	signin: string;
	signout: string;
	share: string;
	search: string;
	talk: string;
	webApi: string;
}

export interface IConfig {
	api: {
		pass: string;
		host: string;
		port: number;
	};
	cookiePass: string;
	host: string;
	hosts: Domains;
	maintainer: string;
	mongo: {
		uri: string;
		options: {
			user: string;
			pass: string;
		}
	};
	redis: {
		host: string;
		pass: string;
	};
	port: {
		http: number;
		https: number;
		streaming: number;
	};
	https: {
		enable: boolean;
		keyPath: string;
		certPath: string;
	};
	sessionKey: string;
	sessionSecret: string;
	recaptcha: {
		siteKey: string;
		secretKey: string;
	};
	url: string;
	themeColor: string;
	domains: Domains;
	urls: Domains;
}

function validateHost(host: string): void {
	if (host.indexOf(':') !== -1) {
		console.error('host にはポート情報は含めないでください。必要であれば port にポート情報を記述してください。');
		process.exit();
	}
}
