export interface Post {
	app: IApplication;
	appId: string;
	createdAt: Date;
	cursor: number;
	favoritesCount: number;
	isDeleted: boolean;
	repliesCount: number;
	repostsCount: number;
	type: string;
	user: IUser;
	userId: string;
}
