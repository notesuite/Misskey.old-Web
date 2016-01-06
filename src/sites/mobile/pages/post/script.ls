$ = require 'jquery'
require '../../common/scripts/ui.js'
post-content-initializer = require '../../common/scripts/post-content-initializer.js'

$ ->
	$post = $ \#post

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
			if check-liked!
				$post.attr \data-is-liked \false
				$.ajax "#{CONFIG.web-api-url}/posts/unlike" {
					data: {'post-id': post-id}}
				.done ->
					$button.attr \disabled off
				.fail ->
					$button.attr \disabled off
					$post.attr \data-is-liked \true
			else
				$post.attr \data-is-liked \true
				$.ajax "#{CONFIG.web-api-url}/posts/like" {
					data: {'post-id': post-id}}
				.done ->
					$button.attr \disabled off
				.fail ->
					$button.attr \disabled off
					$post.attr \data-is-liked \false

		# Init repost button
		..find '> footer > .repost > button' .click ->
			function repost
				$post.attr \data-is-reposted \true
				$.ajax "#{CONFIG.web-api-url}/posts/repost" {
					data: {'post-id': post-id}}
				.done ->
					$button.attr \disabled off
				.fail ->
					$button.attr \disabled off
					$status.attr \data-is-reposted \false

			if check-reposted!
				$post.attr \data-is-reposted \false
				$.ajax "#{CONFIG.web-api-url}/posts/unrepost" {
					data: {'post-id': post-id}}
				.done ->
					$button.attr \disabled off
				.fail ->
					$button.attr \disabled off
					$status.attr \data-is-reposted \true
			else
				if USER_SETTINGS.confirmation-when-repost
					if window.confirm "#{user-name}「#{text}」\nを Repost しますか？"
						repost!
				else
					repost!

	post-content-initializer post-type, $post.find '> .main > .content'
