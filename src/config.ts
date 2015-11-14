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
		streaming: number;
	};
	apiPasskey: string;
	apiServerIp: string;
	apiServerPort: number;
	redisServerHost: string;
	cookiePass: string;
	sessionKey: string;
	sessionSecret: string;
	publicConfig: {
		themeColor: string;
		domain: string;
		host: string;
		url: string;
		apiHost: string;
		apiUrl: string;
		webApiDomain: string;
		webApiHost: string;
		webApiUrl: string;
		developerCenterHost: string;
		developerCenterUrl: string;
		webStreamingUrl: string;
	};
}
