import * as mongoose from 'mongoose';
import config from '../config';

const Schema: typeof mongoose.Schema = mongoose.Schema;

const db: mongoose.Connection = mongoose.createConnection(config.mongo.uri, config.mongo.options);

const schema: mongoose.Schema = new Schema({
	theme: { type: String, required: false, default: null },
	homeLayout: { type: Schema.Types.Mixed, required: true },
	userId: { type: Schema.Types.ObjectId, required: true }
});

if (!(<any>schema).options.toObject) {
	(<any>schema).options.toObject = {};
}
(<any>schema).options.toObject.transform = (doc: any, ret: any) => {
	delete ret._id;
	delete ret.__v;
};

export const UserSettings: mongoose.Model<mongoose.Document> = db.model('UserSettings', schema);

export interface IUserSettings extends mongoose.Document {
	theme: string;
	homeLayout: any;
	userId: mongoose.Types.ObjectId;
}
