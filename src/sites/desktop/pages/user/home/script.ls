require '../../../common/scripts/ui.js'
require '../script.js'
$ = require 'jquery'
Timeline = require '../../../common/scripts/timeline-core.js'

$ ->
	$ \#left-sub-contents .css \padding-top "#{$ \#comment .outer-height! - 16px}px"

	timeline = new Timeline $ '#timeline'

	# Read more
	$ window .scroll ->
		me = $ @
		current = $ window .scroll-top! + window.inner-height
		if current > $ document .height! - 32
			if not me.data \loading
				me.data \loading yes
				$.ajax "#{config.web-api-url}/posts/user-timeline" {
					data:
						limit: 10
						'max-cursor': $ '#timeline > .posts > .post:last-child' .attr \data-cursor}
				.done (posts) ->
					me.data \loading no
					posts.for-each (post) ->
						timeline.add-last post
				.fail (data) ->
					me.data \loading no
