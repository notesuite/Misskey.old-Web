import * as mongoose from 'mongoose';
import config from '../../config';

const Schema: typeof mongoose.Schema = mongoose.Schema;

const db: mongoose.Connection = mongoose.createConnection(config.mongo.uri, config.mongo.options);

const schema: any = {
	displayImageQuality: { type: Number, required: false, default: 90 },
	pseudoPushNotificationDisplayDuration: { type: Number, required: false, default: 5000 },
	enableSushi: { type: Boolean, required: false, default: false },
	displayUserNameInPost: { type: Boolean, required: false, default: true },
	displayUserScreenNameInPost: { type: Boolean, required: false, default: false },
	displayCreatedAtInPost: { type: Boolean, required: false, default: true },
	displayActionsInPost: { type: Boolean, required: false, default: true },
	confirmationWhenRepost: { type: Boolean, required: false, default: true },
	enableUrlPreviewInPost: { type: Boolean, required: false, default: true },
	thumbnailyzeAttachedImageOfPost: { type: Boolean, required: false, default: false },
	enableNotificationSoundWhenReceivingNewPost: { type: Boolean, required: false, default: true },
	readTimelineAutomatically: { type: Boolean, required: false, default: true },
	theme: { type: String, required: false, default: null },
	uiLanguage: { type: String, required: false, default: null },
	homeLayout: { type: Schema.Types.Mixed, required: false, default: {
		left: [],
		center: ['timeline'],
		right: ['my-status', 'notifications', 'recommendation-users', 'donate', 'ad']
	}},
	mobileHeaderOverlay: { type: String, required: false, default: null },
	userId: { type: Schema.Types.ObjectId, required: true }
};

const schemaObj: mongoose.Schema = new Schema(schema);

if (!(<any>schemaObj).options.toObject) {
	(<any>schemaObj).options.toObject = {};
}
(<any>schemaObj).options.toObject.transform = (doc: any, ret: any) => {
	delete ret.userId;
	delete ret._id;
	delete ret.__v;
};

export const UserSettings: mongoose.Model<mongoose.Document> = db.model('UserSettings', schemaObj);

export interface IUserSettings extends mongoose.Document {
	displayImageQuality: number;
	pseudoPushNotificationDisplayDuration: number;
	uiLanguage: string;
	theme: string;
	homeLayout: any;
	mobileHeaderOverlay: string;
	userId: mongoose.Types.ObjectId;
}

let guestUserSettings0: any = {};

for (let key in schema) {
	if (schema.hasOwnProperty(key)) {
		const value = schema[key];
		if (!value.required) {
			guestUserSettings0[key] = value.default;
		}
	}
}

export const guestUserSettings = guestUserSettings0;
