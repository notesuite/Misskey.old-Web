import {User} from './user';

export interface Post {
	app: any;
	appId: string;
	createdAt: Date;
	cursor: number;
	favoritesCount: number;
	isDeleted: boolean;
	repliesCount: number;
	repostsCount: number;
	type: string;
	user: User;
	userId: string;
}
