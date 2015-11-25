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

	$post.find '> .main > .reply-form textarea' .on \paste (event) ->
		items = (event.clipboard-data || event.original-event.clipboard-data).items
		for i from 0 to items.length - 1
			item = items[i]
			if item.kind == \file && item.type.index-of \image != -1
				file = item.get-as-file!
				upload-new-file file

	$post.find '> .main > .reply-form textarea' .keypress (e) ->
		if (e.char-code == 10 || e.char-code == 13) && e.ctrl-key
			submit-reply!

	$post.find '> .main > .reply-form .attach-from-album' .click ->
		window.open-select-album-file-dialog (files) ->
			files.for-each (file) ->
				add-file file

	$post.find '> .main > .reply-form .attach-from-local' .click ->
		$post.find '> .main > .reply-form input[type=file]' .click!
		false

	$post.find '> .main > .reply-form input[type=file]' .change ->
		files = ($post.find '> .main > .reply-form input[type=file]')[0].files
		for i from 0 to files.length - 1
			file = files.item i
			upload-new-file file

	$post.find '> .main > .reply-form' .submit (event) ->
		event.prevent-default!
		submit-reply!

	function submit-reply
		$form = $post.find '> .main > .reply-form'
		$submit-button = $form.find \.submit-button
			..attr \disabled on
			..text 'Replying...'

		$.ajax "#{config.web-api-url}/web/sites/desktop/post/reply" {
			type: \post
			data:
				'text': ($form.find \textarea .val!)
				'in-reply-to-post-id': ($post.attr \data-id)
				'photos': JSON.stringify(($form.find '.photos > li' .map ->
					($ @).attr \data-id).get!)
			data-type: \text
			xhr-fields: {+with-credentials}}
		.done (html) ->
			$reply = $ html
			$submit-button.attr \disabled off
			$reply.prepend-to $post.find '> .main > .replies'
			$form.remove!
			window.display-message '返信しました！'
		.fail ->
			window.display-message '返信に失敗しました。再度お試しください。'
			$submit-button
				..attr \disabled off
				..text 'Re Reply'

	function add-file(file-data)
		$thumbnail = $ "<li style='background-image: url(#{file-data.url});' data-id='#{file-data.id}' />"
		$remove-button = $ '<button class="remove" title="添付を取り消し"><img src="/resources/desktop/images/form-file-thumbnail-remove.png" alt="remove"></button>'
		$thumbnail.append $remove-button
		$remove-button.click (e) ->
			e.stop-immediate-propagation!
			$thumbnail.remove!
		$post.find '> .main > .reply-form .photos' .append $thumbnail

	function upload-new-file(file)
		name = if file.has-own-property \name then file.name else 'untitled'
		$info = $ "<li><p class='name'>#{name}</p><progress></progress></li>"
		$progress-bar = $info.find \progress
		$post.find '> .main > .reply-form .uploads' .append $info
		window.upload-file do
			file
			(total, uploaded, percentage) ->
				if percentage == 100
					$progress-bar
						..remove-attr \value
						..remove-attr \max
				else
					$progress-bar
						..attr \max total
						..attr \value uploaded
			(html) ->
				$info.remove!
				add-file JSON.parse ($ html).attr \data-data
			->
				$info.remove!

$ ->
	init-post $ '#post > article'
