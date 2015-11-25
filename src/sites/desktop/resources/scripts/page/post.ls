$ = require 'jquery'
Sortable = require 'Sortable'
require '../common/ui.js'
sncompleter = require '../common/sncompleter.js'
post-content-initializer = require '../common/post-content-initializer.js'

function init-post($post)
	post-type = $post.attr \data-type

	Sortable.create ($post.find '> .main > .reply-form .photos')[0], {
		animation: 150ms
	}

	sncompleter $post.find '> .main > .reply-form textarea'

	post-content-initializer post-type, $post.find '> .main > .body > .content'

$ ->
	init-post $ '#post > article'
