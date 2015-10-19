export const homeDirPath: string = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
export const configDirName: string = '.misskey';
export const configFileName: string = 'web.json';
export const configDirectoryPath: string = `${homeDirPath}/${configDirName}`;
export const configPath: string = `${configDirectoryPath}/${configFileName}`;

export default loadConfig();

function loadConfig(): IConfig {
	'use strict';
	try {
		return <IConfig>require(configPath);
	} catch (e) {
		return null;
	}
}

export interface IConfig {
	mongo: {
		uri: string;
		options: {
			user: string;
			pass: string;
		};
	};
	port: {
		http: number;
		https: number;
	};
	apiServerIp: string;
	apiServerPort: number;
	cookiePass: string;
	sessionKey: string;
	sessionSecret: string;
	publicConfig: {
		themeColor: string;
		host: string;
		url: string;
		apiHost: string;
		apiUrl: string;
		developerCenterHost: string;
		developerCenterUrl: string;
		webStreamingUrl: string;
	};
}

export const defaultConfig: IConfig = {
	mongo: {
		uri: "mongodb://localhost/Misskey",
		options: {
			user: "",
			pass: ""
		}
	},
	port: {
		http: 80,
		https: 443
	},
	apiServerIp: "",
	apiServerPort: 0,
	cookiePass: "",
	sessionKey: "sid",
	sessionSecret: "",
	publicConfig: {
		themeColor: "#0e91bc",
		host: "misskey.xyz",
		url: "http://misskey.xyz",
		apiHost: "api.misskey.xyz",
		apiUrl: "http://api.misskey.xyz",
		developerCenterHost: "dev.misskey.xyz",
		developerCenterUrl: "http://dev.misskey.xyz",
		webStreamingUrl: "http://api.misskey.xyz:2000"
	}
};
