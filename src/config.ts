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

	// Define hosts
	conf.public.hosts = {
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
		search: `${domains.search}.${domain}`,
		talk: `${domains.talk}.${domain}`,
		help: `${domains.help}.${domain}`,
		color: `${domains.color}.${domain}`
	};

	// Define URLs
	conf.public.urls = {
		admin: `${scheme}${domains.admin}.${domain}`,
		i: `${scheme}${domains.i}.${domain}`,
		about: `${scheme}${domains.about}.${domain}`,
		api: `${scheme}${domains.api}.${domain}`,
		webApi: `${scheme}${domains.webApi}.${domain}`,
		resources: `${scheme}${domains.resources}.${domain}`,
		signup: `${scheme}${domains.signup}.${domain}`,
		signin: `${scheme}${domains.signin}.${domain}`,
		signout: `${scheme}${domains.signout}.${domain}`,
		share: `${domains.share}.${domain}`,
		search: `${scheme}${domains.search}.${domain}`,
		talk: `${scheme}${domains.talk}.${domain}`,
		help: `${domains.help}.${domain}`,
		color: `${scheme}${domains.color}.${domain}`
	};

	return conf;
}

export default loadConfig();

//////////////////////////////////////////////////
// CONFIGURATION INTERFACE DEFINITION

interface Domains {
	admin: string;
	i: string;
	api: string;
	webApi: string;
	resources: string;
	signup: string;
	signin: string;
	signout: string;
	share: string;
	search: string;
	color: string;
	talk: string;
	help: string;
	about: string;
}

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
		domains: Domains;
		hosts: Domains;
		urls: Domains;
	};
}
