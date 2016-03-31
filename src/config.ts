//////////////////////////////////////////////////
// CONFIGURATION MANAGER
//////////////////////////////////////////////////

// Detect home path
const home = process.env[
	process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];

// Name of directory that includes config file
const dirName = '.misskey';

// Name of config file
const fileName = 'web.json';

// Resolve paths...
const dirPath = `${home}/${dirName}`;
const path = `${dirPath}/${fileName}`;

//////////////////////////////////////////////////
// CONFIGURATION LOADER

function loadConfig(): IConfig {
	// Read config file
	let conf = <IConfig>require(path);

	const domain = conf.public.domain;
	const domains = conf.public.domains;

	const scheme = conf.https.enable ? 'https://' : 'http://';
	conf.public.url = `${scheme}${conf.public.domain}`;

	// Define URLs
	(<any>conf).public.urls = {
		admin: `${scheme}${domains.admin}.${domain}`,
		i: `${scheme}${domains.i}.${domain}`,
		api: `${scheme}${domains.api}.${domain}`,
		webApi: `${scheme}${domains.webApi}.${domain}`,
		resources: `${scheme}${domains.resources}.${domain}`,
		signup: `${scheme}${domains.signup}.${domain}`,
		signin: `${scheme}${domains.signin}.${domain}`,
		signout: `${scheme}${domains.signout}.${domain}`,
		search: `${scheme}${domains.search}.${domain}`,
		talk: `${scheme}${domains.talk}.${domain}`,
		color: `${scheme}${domains.color}.${domain}`
	};

	return conf;
}

export default loadConfig();

//////////////////////////////////////////////////
// CONFIGURATION INTERFACE DEFINITION

export interface IConfig {
	mongo: {
		uri: string;
		options: {
			user: string;
			pass: string;
		}
	};
	redis: {
		host: string;
		password: string;
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
	api: {
		passkey: string;
		ip: string;
		port: number;
	};
	bindIp: string;
	cookiePass: string;
	sessionKey: string;
	sessionSecret: string;
	recaptchaSecretKey: string;
	public: {
		domain: string;
		url: string;
		themeColor: string;
		recaptchaSiteKey: string;
		domains: {
			admin: string;
			i: string;
			api: string;
			webApi: string;
			resources: string;
			signup: string;
			signin: string;
			signout: string;
			search: string;
			color: string;
			talk: string;
			help: string;
			about: string;
		};
		urls: {
			admin: string;
			i: string;
			api: string;
			webApi: string;
			resources: string;
			signup: string;
			signin: string;
			signout: string;
			search: string;
			color: string;
			talk: string;
			help: string;
			about: string;
		};
	};
}
