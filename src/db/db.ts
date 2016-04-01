//////////////////////////////////////////////////
// DB
//////////////////////////////////////////////////

import * as mongoose from 'mongoose';
import config from '../config';

// init mongo connection
const db = mongoose.createConnection(
	config.mongo.uri, config.mongo.options);

db.once('open', () => {
	console.log('Connected to MongoDB');
});

db.on('error', (err: any) => {
	console.error(`MongoDB connection error: ${err}`);
});

export default db;
