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
	apiServerPort: 0
};
