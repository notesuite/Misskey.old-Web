$ = require 'jquery'
post-content-initializer = require './post-content-initializer.js'
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

		post-type = $post.attr \data-type

		$post
			# Init like button
			..find '> .footer > .actions > .like > .like-button' .click ->
				$button = $ @
					..attr \disabled on
				if check-liked!
					$post.attr \data-is-liked \false
					$.ajax "#{config.web-api-url}/posts/unlike" {
						data: {'post-id': $post.attr \data-id}}
					.done ->
						$button.attr \disabled off
					.fail ->
						$button.attr \disabled off
						$post.attr \data-is-liked \true
				else
					$post.attr \data-is-liked \true
					$.ajax "#{config.web-api-url}/posts/like" {
						data: {'post-id': $post.attr \data-id}}
					.done ->
						$button.attr \disabled off
					.fail ->
						$button.attr \disabled off
						$post.attr \data-is-liked \false

			# Init reply button
			..find '> .footer > .actions > .reply > .reply-button' .click ->
				activate-display-state!

			# Init repost button
			..find '> .footer > .actions > .repost > .repost-button' .click ->
				if check-reposted!
					$post.attr \data-is-reposted \false
					$.ajax "#{config.web-api-url}/post/unrepost" {
						data: {'post-id': $status.attr \data-id}}
					.done ->
						$button.attr \disabled off
					.fail ->
						$button.attr \disabled off
						$status.attr \data-is-reposted \true
				else
					$post.find '> .repost-form .background' .css \display \block
					$post.find '> .repost-form .background' .animate {
						opacity: 1
					} 100ms \linear
					$post.find '> .repost-form .form' .css \display \block
					$post.find '> .repost-form .form' .animate {
						opacity: 1
					} 100ms \linear

		post-content-initializer post-type, $post.find '> .main > .content'

	add: (post) ->
		THIS = @

		$post = $ post-compiler {
			post
			config: CONFIG
			me: ME
		}

		$recent-post = THIS.tl.children ':first-child'
		if ($recent-post.attr \data-is-display-active) == \true
			$post.add-class \display-active-before
		THIS.init-post $post
		$post.prepend-to THIS.tl .hide!.slide-down 200ms
		THIS.refresh-my-posts!

	add-last: (post) ->
		THIS = @

		$post = $ post-compiler {
			post
			config: CONFIG
			me: ME
		}

		THIS.init-post $post
		$post.append-to THIS.tl
		THIS.refresh-my-posts!

	refresh-my-posts: ->
		THIS = @
		THIS.posts = THIS.tl.children!

module.exports = Timeline
