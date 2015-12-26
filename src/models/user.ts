export interface User {
	id: string;
	createdAt: Date;
	name: string;
	screenName: string;
	comment: string;
	description: string;
	color: string;
	email: string;
	lang: string;
	location: string;
	credit: number;
	pinnedStatus: string;
	websiteUrl: string;
	avatarUrl: string;
	bannerUrl: string;
	wallpaperUrl: string;
	birthday: Date;
	isVerfied: boolean;
	isEmailVerified: boolean;
	isPro: boolean;
	isPrivate: boolean;
	isSuspended: boolean;
	isDeleted: boolean;
	_settings: any;
}
