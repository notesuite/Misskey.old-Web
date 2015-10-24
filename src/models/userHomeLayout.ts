import * as mongoose from 'mongoose';
import config from '../config';

const Schema: typeof mongoose.Schema = mongoose.Schema;

const db: mongoose.Connection = mongoose.createConnection(config.mongo.uri, config.mongo.options);

const schema: mongoose.Schema = new Schema({
	layout: { type: Schema.Types.Mixed, required: true },
	userId: { type: Schema.Types.ObjectId, required: true }
});

export const UserHomeLayout: mongoose.Model<mongoose.Document> = db.model('UserHomeLayout', schema);

export interface IUserHomeLayout extends mongoose.Document {
	layout: any;
	userId: mongoose.Types.ObjectId;
}
