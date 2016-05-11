$ = require 'jquery'
require 'jquery.transit'
post-content-initializer = require './post-content-initializer.ls'
post-compiler = require '../views/post/smart/render.jade'

class Timeline
	($tl) ->
		THIS = @

		THIS.tl = $tl.find '> .posts'
		THIS.posts = THIS.tl.children!

		THIS.posts.each ->
			THIS.init-post $ @

	init-post: ($post) ->
		THIS = @

		function check-liked
			($post.attr \data-is-liked) == \true

		function check-reposted
			($post.attr \data-is-reposted) == \true

		post-id = $post.attr \data-id
		post-type = $post.attr \data-type
		user-name = $post.attr \data-user-name
		user-screen-name = $post.attr \data-user-screen-name
		text = $post.find '> .main > .content > .text' .text!

		$post
			# Init like button
			..find '> footer > .like > button' .click ->
				$button = $ @
					..attr \disabled on
				#$button.find \i .transition {
				#	perspective: '100px'
				#	rotate-x: '-360deg'
				#} 500ms
				if check-liked!
					$post.attr \data-is-liked \false
					$.ajax "#{CONFIG.urls.api}/posts/unlike" {
						data: {'post-id': post-id}}
					.done ->
						$button.attr \disabled off
					.fail ->
						$button.attr \disabled off
						$post.attr \data-is-liked \true
				else
					$post.attr \data-is-liked \true
					$.ajax "#{CONFIG.urls.api}/posts/like" {
						data: {'post-id': post-id}}
					.done ->
						$button.attr \disabled off
					.fail ->
						$button.attr \disabled off
						$post.attr \data-is-liked \false

			# Init reply button
			..find '> footer > .reply > button' .click ->
				reply-text = window.prompt do
					LOCALE.sites.mobile.common.post.reply_dialog
						.replace '{user-name}' user-name
						.replace '{text}' text
					"@#{user-screen-name} "

				if reply-text? and reply-text != ''
					$.ajax "#{CONFIG.urls.api}/posts/reply" {
						data:
							type: \text
							text: reply-text
							'in-reply-to-post-id': post-id
					} .done (data) ->
						#
					.fail (data) ->
						error = data.error
						switch error
						| \empty-text => window.alert 'テキストを入力してください。'
						| \too-long-text => window.alert 'テキストが長過ぎます。'
						| \duplicate-content => window.alert '投稿が重複しています。'
						| _ => window.alert "不明なエラー (#error-code)"

			# Init repost button
			..find '> footer > .repost > button' .click ->
				function repost
					$post.attr \data-is-reposted \true
					$.ajax "#{CONFIG.urls.api}/posts/repost" {
						data: {'post-id': post-id}}
					.done ->
						$button.attr \disabled off
					.fail ->
						$button.attr \disabled off
						$status.attr \data-is-reposted \false

				if check-reposted!
					$post.attr \data-is-reposted \false
					$.ajax "#{CONFIG.urls.api}/posts/unrepost" {
						data: {'post-id': post-id}}
					.done ->
						$button.attr \disabled off
					.fail ->
						$button.attr \disabled off
						$status.attr \data-is-reposted \true
				else
					if USER_SETTINGS.confirmation-when-repost
						confirm = window.confirm do
							LOCALE.sites.mobile.common.post.repost_confirm
								.replace '{user-name}' user-name
								.replace '{text}' text
						if confirm
							repost!
					else
						repost!

		post-content-initializer post-type, $post.find '> .main > .content'

	add: (post) ->
		THIS = @

		$post = $ post-compiler {
			post
			
			me: ME
			locale: LOCALE
			user-settings: USER_SETTINGS
		}

		$recent-post = THIS.tl.children ':first-child'
		if ($recent-post.attr \data-is-display-active) == \true
			$post.add-class \display-active-before
		THIS.init-post $post
		$post.prepend-to THIS.tl
		THIS.refresh-my-posts!

	add-last: (post) ->
		THIS = @

		$post = $ post-compiler {
			post
			
			me: ME
			locale: LOCALE
			user-settings: USER_SETTINGS
		}

		THIS.init-post $post
		$post.append-to THIS.tl
		THIS.refresh-my-posts!

	refresh-my-posts: ->
		THIS = @
		THIS.posts = THIS.tl.children!

module.exports = Timeline
