require '../../../common/scripts/ui.js'
$ = require 'jquery'
Timeline = require '../../../common/scripts/timeline-core.js'

timeline = null
timeline-loading = no

$ ->
	timeline := new Timeline $ '#posts'

	$ '#posts > .read-more' .click ->
		read-more!

	# Read more automatically
	if USER_SETTINGS.read-timeline-automatically
		$ window .scroll ->
			current = $ window .scroll-top! + window.inner-height
			if current > $ document .height! - 16 # 遊び
				read-more!

function read-more
	$button = $ '#posts > .read-more'
	if not timeline-loading
		timeline-loading := yes
		$button.attr \disabled on
		$button.text '読み込み中'
		$.ajax "#{CONFIG.web-api-url}/posts/search" {
			data:
				'query': QUERY
				'limit': 20
				'max-cursor': $ '#posts > .posts > .post:last-child' .attr \data-cursor}
		.done (posts) ->
			posts.for-each (post) ->
				timeline.add-last post
		.fail (data) ->
		.always ->
			timeline-loading := no
			$button.attr \disabled off
			$button.text 'もっと読み込む'
