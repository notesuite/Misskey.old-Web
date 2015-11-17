import { User } from '../../../models/user';
import { Post } from '../../../models/post';
import { UserHomeLayout, IUserHomeLayout } from '../../../models/userHomeLayout';
import { MisskeyExpressRequest } from '../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../misskeyExpressResponse';
// import generateHomeTimelineHtml from '../utils/generateHomeTimelineHtml';
import parsePostText from '../../../utils/parsePostText';
import requestApi from '../../../utils/requestApi';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse, options: any = {}): void => {
	'use strict';

	const customizeMode: boolean = options.customize ? options.customize : false;
	const me: User = req.me;
	const widgets: string[] = [
		'timeline',
		'my-status',
		'notices',
		'recommendation-users',
		'donate',
		'big-analog-clock',
		'small-analog-clock',
		'big-calendar',
		'small-calendar'
	];

	UserHomeLayout.findOne({userId: me.id}, (homeLayoutFindErr: any, userLayout: IUserHomeLayout) => {
		const defaultLayout: any = {
			left: [],
			center: ['timeline'],
			right: ['my-status', 'notices', 'recommendation-users', 'donate']
		};
		const layout: any = userLayout ? userLayout.layout : defaultLayout;
		const useWidgets: string[] = layout.left.concat(layout.center.concat(layout.right));
		const unuseWidgets: string[] = widgets.map((widget: string) => {
			if (useWidgets.indexOf(widget) === -1) {
				return widget;
			}
		});

		Promise.all([
			// Get timeline
			new Promise((resolve: (timeline: Post[]) => void, reject: (err: any) => void) => {
				if (customizeMode || useWidgets.indexOf('timeline') > -1) {
					requestApi('GET', 'posts/timeline', { 'limit': 10 }, me.id).then((tl: Post[]) => {
						console.log(tl);
						resolve(tl.map((post: Post) => {
							switch (post.type) {
								case 'status':
									(<any>post).text = parsePostText((<any>post).text, (<any>post).isPlain);
									break;
								default:
									break;
							}
							return post;
						}));
					});
				} else {
					resolve(null);
				}
			})/*,

			// Get recommendation users
			new Promise((resolve, reject) => {
				if (customizeMode || useWidgets.indexOf('recommendation-users') > -1) {
					getNewUsers(5).then((users) => {
						Promise.all(users.map((user) => {
							return new Promise((resolve, reject) => {
								userFollowingCheck(me.id, user.id).then((isFollowing) => {
									user.isFollowing = isFollowing;
									resolve(user);
								});
							});
						}).then((res) => {
							resolve(res);
						});
					});
				} else {
					resolve(null);
				}
			})*/
		]).then((results: any[]) => {
			res.display(req, 'home', {
				layout: layout,
				unuseWidgets: unuseWidgets,
				customizeMode: customizeMode,
				timeline: results[0],
				recommendationUsers: results[1]
			});
		}, (err: any) => {
			console.error(err);
		});
	});
};
