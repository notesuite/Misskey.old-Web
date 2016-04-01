$ = require 'jquery/dist/jquery'
require '../../common/scripts/ui.ls'
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
		# Init reply button
		..find '> footer > .reply > button' .click ->
			$ \#form .find \textarea .focus!

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

	$form = $ \#form
	$textarea = $form.find \textarea
		..focus!
	$submit-button = $form.find '[type="submit"]'
	$progress = $form.find \progress
		..css \display \none

	$form.submit (event) ->
		event.prevent-default!
		$submit-button.attr \disabled on
		$submit-button.find \p .text '投稿しています...'
		$submit-button.find \i .attr \class 'fa fa-spinner fa-spin'
		$progress.css \display \block

		$.ajax "#{CONFIG.web-api-url}/web/posts/create-with-file", {
			data: new FormData $form.0
			+async
			-process-data
			-content-type
			headers: {
				'csrf-token': CSRF_TOKEN
			}
			xhr: ->
				XHR = $.ajax-settings.xhr!
				if XHR.upload
					XHR.upload.add-event-listener \progress progress, false
				XHR
		}
		.done ->
			location.reload!
		.fail (err) ->
			$submit-button.attr \disabled off
			$submit-button.find \p .text '投稿'
			$submit-button.find \i .attr \class 'fa fa-paper-plane'
			$progress.css \display \none
			alert "返信に失敗しました。再度お試しください。\r\nErrorCode: #{err.response-text}"

		function progress e
			percentage = Math.floor (parse-int e.loaded / e.total * 10000) / 100
			if percentage == 100
				$progress
					..remove-attr \value
					..remove-attr \max
			else
				$progress
					..attr \max e.total
					..attr \value e.loaded
