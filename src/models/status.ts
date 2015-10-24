export interface Status {
	id: string;
	userId: string;
	appId: string;
	createdAt: Date;
	cursor: number;
	text: string;
	attachedFileIds: string[];
	inReplyToStatusId: string;
	isContentModified: string;
	isDeleted: string;
}
