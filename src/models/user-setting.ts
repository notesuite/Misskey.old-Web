import * as mongoose from 'mongoose';
import config from '../config';

const Schema: typeof mongoose.Schema = mongoose.Schema;

const db: mongoose.Connection = mongoose.createConnection(config.mongo.uri, config.mongo.options);

const schema: mongoose.Schema = new Schema({
	theme: { type: String, required: false, default: null },
	userId: { type: Schema.Types.ObjectId, required: true }
});

export const UserSetting: mongoose.Model<mongoose.Document> = db.model('UserSetting', schema);

export interface IUserSetting extends mongoose.Document {
	theme: string;
	userId: mongoose.Types.ObjectId;
}
