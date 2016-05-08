require '../../../common/scripts/ui.ls'
require '../script.ls'
$ = require 'jquery'
Timeline = require '../../../common/scripts/timeline-core.ls'

timeline = null
timeline-loading = no

$ window .on 'load scroll resize' ->
	window-top = $ window .scroll-top!
	window-height = window.inner-height
	window-top-margin = $ \#misskey-header .outer-height!

	$sub = $ \#sub-contents
	$sub-body = $sub.children \.body
	sub-top = $sub.offset!.top
	sub-height = $sub-body.outer-height!

	top-margin = sub-top

	sub-overflow = (sub-top + sub-height) - window-height
	if sub-overflow < 0 then sub-overflow = 0
	if window-top + window-height > sub-top + sub-height and window-top + window-top-margin > top-margin
		padding =  window-height - sub-height - window-top-margin
		if padding < 0 then padding = 0
		if window-height > sub-top + sub-height then padding -= window-height - (sub-top + sub-height)
		margin = window-top - sub-overflow - padding
		$sub-body.css \margin-top "#{margin}px"
	else
		$sub-body.css \margin-top 0

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
		$.ajax "#{CONFIG.urls.web-api}/posts/user-timeline" {
			data:
				limit: 20
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
