console.log('Welcome to Misskey!');

import * as readline from 'readline';
import * as fs from 'fs';
import * as config from './config';

if (fs.existsSync(config.configPath)) {
	initServer();
} else {
	// Init config form
	const i: readline.ReadLine = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	i.question('Enter the user name of MongoDB: ', (mongoUserName: string) => {
		i.question('Enter the password of MongoDB: ', (mongoPassword: string) => {
			i.close();

			const conf: config.IConfig = config.defaultConfig;
			conf.mongo.options.user = mongoUserName;
			conf.mongo.options.pass = mongoPassword;

			if (!fs.existsSync(config.configDirectoryPath)) {
				fs.mkdirSync(config.configDirectoryPath);
			}
			fs.writeFile(config.configPath, JSON.stringify(conf, null, '\t'), (writeErr: NodeJS.ErrnoException) => {
				if (writeErr) {
					console.log('configの書き込み時に問題が発生しました:');
					console.error(writeErr);
				} else {
					initServer();
				}
			});
		});
	});
}

function initServer(): void {
	'use strict';
	require('./server');
}
