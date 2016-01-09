require '../../../common/scripts/ui.js'
require '../script.js'
$ = require 'jquery/dist/jquery'
Timeline = require '../../../common/scripts/timeline-core.js'

timeline = null
timeline-loading = no

$ ->
	$ \#left-sub-contents .css \padding-top "#{$ \#comment .outer-height! - 16px}px"

	timeline := new Timeline $ '#timeline'

	$ '#timeline > .read-more' .click ->
		read-more!

	# Read more automatically
	if USER_SETTINGS.read-timeline-automatically
		$ window .scroll ->
			current = $ window .scroll-top! + window.inner-height
			if current > $ document .height! - 16 # 遊び
				read-more!

function read-more
	$button = $ '#timeline > .read-more'
	if not timeline-loading
		timeline-loading := yes
		$button.attr \disabled on
		$button.text '読み込み中'
		$.ajax "#{CONFIG.web-api-url}/posts/user-timeline" {
			data:
				limit: 10
				'user-id': USER.id
				'max-cursor': $ '#timeline > .posts > .post:last-child' .attr \data-cursor}
		.done (posts) ->
			posts.for-each (post) ->
				timeline.add-last post
		.fail (data) ->
		.always ->
			timeline-loading := no
			$button.attr \disabled off
			$button.text 'もっと読み込む'
