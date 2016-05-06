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

	const host = conf.host;
	const domains = conf.domains;

	const scheme = conf.https.enable ? 'https' : 'http';
	const port = conf.https.enable
		? conf.port.https === 443 ? '' : ':' + conf.port.https
		: conf.port.http === 80 ? '' : ':' + conf.port.http;

	conf.url = `${scheme}://${host}` + port;

	// Define hosts
	conf.hosts = {
		admin: `${domains.admin}.${domain}`,
		i: `${domains.i}.${domain}`,
		about: `${scheme}${domains.about}.${domain}`,
		api: `${domains.api}.${domain}`,
		webApi: `${domains.webApi}.${domain}`,
		resources: `${domains.resources}.${domain}`,
		signup: `${domains.signup}.${domain}`,
		signin: `${domains.signin}.${domain}`,
		signout: `${domains.signout}.${domain}`,
		share: `${domains.share}.${domain}`,
		forum: `${domains.forum}.${domain}`,
		search: `${domains.search}.${domain}`,
		talk: `${domains.talk}.${domain}`,
		help: `${domains.help}.${domain}`,
		color: `${domains.color}.${domain}`
	};

	// Define URLs
	conf.urls = {
		admin: `${scheme}${domains.admin}.${domain}`,
		i: `${scheme}${domains.i}.${domain}`,
		about: `${scheme}${domains.about}.${domain}`,
		api: `${scheme}${domains.api}.${domain}`,
		webApi: `${scheme}${domains.webApi}.${domain}`,
		resources: `${scheme}${domains.resources}.${domain}`,
		signup: `${scheme}${domains.signup}.${domain}`,
		signin: `${scheme}${domains.signin}.${domain}`,
		signout: `${scheme}${domains.signout}.${domain}`,
		share: `${scheme}${domains.share}.${domain}`,
		forum: `${scheme}${domains.forum}.${domain}`,
		search: `${scheme}${domains.search}.${domain}`,
		talk: `${scheme}${domains.talk}.${domain}`,
		help: `${scheme}${domains.help}.${domain}`,
		color: `${scheme}${domains.color}.${domain}`
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
	recaptchaSecretKey: string;
	recaptchaSiteKey: string;
	url: string;
	themeColor: string;
	domains: Domains;
	urls: Domains;
}
