import * as mongoose from 'mongoose';
import config from '../config';

const Schema: typeof mongoose.Schema = mongoose.Schema;

const db: mongoose.Connection = mongoose.createConnection(config.mongo.uri, config.mongo.options);

const schema: mongoose.Schema = new Schema({
	layout: { type: Schema.Types.Mixed, required: true },
	userId: { type: Schema.Types.ObjectId, required: true }
});

export const HomeLayout: mongoose.Model<mongoose.Document> = db.model('HomeLayout', schema);

export interface IHomeLayout extends mongoose.Document {
	layout: any;
	userId: mongoose.Types.ObjectId;
}
