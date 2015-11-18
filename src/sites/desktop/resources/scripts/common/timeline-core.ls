$ = require 'jquery'
Sortable = require 'Sortable'
Album = require '../common/album.js'

album = new Album

TIMELINE_CORE = {}
	..init = ($tl) ->
		TIMELINE_CORE.tl = $tl
		$tl.find '> .posts > .post' .each ->
			TIMELINE_CORE.set-event $ @

	..set-event = ($post) ->
		function check-favorited
			($post.attr \data-is-favorited) == \true

		function check-reposted
			($post.attr \data-is-reposted) == \true

		function activate-display-state
			animation-speed = 200ms
			if ($post.attr \data-display-html-is-active) == \false
				reply-form-text = $post.children \article .find '.form-and-replies .reply-form textarea' .val!
				TIMELINE_CORE.tl.find '> .posts > .post' .each ->
					$ @
						..attr \data-display-html-is-active \false
						..remove-class \display-html-active-status-prev
						..remove-class \display-html-active-status-next
				TIMELINE_CORE.tl.find '> .posts > .post > article > .talk > i' .each ->
					$ @ .show animation-speed
				TIMELINE_CORE.tl.find '> .posts > .post > article > .talk > .posts' .each ->
					$ @ .hide animation-speed
				TIMELINE_CORE.tl.find '> .posts > .post > article > .reply-info' .each ->
					$ @ .show animation-speed
				TIMELINE_CORE.tl.find '> .posts > .post > article > .form-and-replies' .each ->
					$ @ .hide animation-speed
				$post
					..attr \data-display-html-is-active \true
					..parent!.prev!.add-class \display-html-active-status-prev
					..parent!.next!.add-class \display-html-active-status-next
					..children \article .find  '.talk > i' .hide animation-speed
					..children \article .find  '.talk > .statuses' .show animation-speed
					..children \article .find  '.reply-info' .hide animation-speed
					..children \article .find  '.form-and-replies' .show animation-speed
					..children \article .find  '.form-and-replies .reply-form textarea' .val ''
					..children \article .find  '.form-and-replies .reply-form textarea' .focus! .val reply-form-text
			else
				$post
					..attr \data-display-html-is-active \false
					..parent!.prev!.remove-class \display-html-active-status-prev
					..parent!.next!.remove-class \display-html-active-status-next
					..children \article .find  '.talk > i' .show animation-speed
					..children \article .find  '.talk > .statuses' .hide animation-speed
					..children \article .find  '.reply-info' .show animation-speed
					..children \article .find  '.form-and-replies' .hide animation-speed

		function submit-reply
			$form = $post.find '.reply-form'
			$submit-button = $form.find \.submit-button
				..attr \disabled on
				..text 'Replying...'

			fd = new FormData!
			fd.append \text ($form.find \textarea .val!)
			fd.append \in-reply-to-post-id ($post.attr \data-id)
			fd.append \photos JSON.stringify(($form.find '.photos > li' .map ->
				($ @).attr \data-id).get!)

			$.ajax "#{config.web-api-url}/web/desktop/home/posts/reply" {
				type: \post
				data: fd
				-process-data
				-content-type
				data-type: \text
				xhr-fields: {+with-credentials}}
			.done (html) ->
				$reply = $ html
				$submit-button.attr \disabled off
				$reply.append-to $post.find '.replies'
				$i = $ '<i class="fa fa-ellipsis-v reply-info" style="display: none;"></i>'
				$i.append-to $post
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
			$post.find '.reply-form .photos' .append $thumbnail

		function upload-new-file(file)
			name = if file.has-own-property \name then file.name else 'untitled'
			$info = $ "<li><p class='name'>#{name}</p><progress></progress></li>"
			$progress-bar = $info.find \progress
			$post.find '.reply-form .uploads' .append $info
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

		Sortable.create ($post.find '.reply-form .photos')[0], {
			animation: 150ms
		}

		$post.find '.reply-form textarea' .on \paste (event) ->
			items = (event.clipboard-data || event.original-event.clipboard-data).items
			for i from 0 to items.length - 1
				item = items[i]
				if item.kind == \file && item.type.index-of \image != -1
					file = item.get-as-file!
					upload-new-file file

		$post.find '.reply-form textarea' .keypress (e) ->
			if (e.char-code == 10 || e.char-code == 13) && e.ctrl-key
				submit-reply!

		$post.find '.reply-form .attach-from-album' .click ->
			window.open-select-album-file-dialog (files) ->
				files.for-each (file) ->
					add-file file

		$post.find '.reply-form .attach-from-local' .click ->
			$post.find '.reply-form input[type=file]' .click!
			false

		$post.find '.reply-form input[type=file]' .change ->
			files = ($post.find '.reply-form input[type=file]')[0].files
			for i from 0 to files.length - 1
				file = files.item i
				upload-new-file file

		$post
			# Click event
			..click (event) ->
				can-event = ! (((<[ input textarea button i time a ]>
					.map (element) -> $ event.target .is element)
					.index-of yes) >= 0)

				if document.get-selection!.to-string! != ''
					can-event = no

				if $ event.target .closest \.repost-form .length > 0
					can-event = no

				if can-event
					activate-display-state!

			# Images
			..find '.main .attached-images > .images > .image' .each ->
				$image = $ @
				$img = $image.find \img
				$button = $image.find \button
				$back = $image.find \.background

				$img.click ->
					if ($image.attr \data-is-expanded) == \true
						$image.attr \data-is-expanded \false
						$back.animate {
							opacity: 0
						} 100ms \linear ->
							$back.css \display \none
				$back.click ->
					if ($image.attr \data-is-expanded) == \true
						$image.attr \data-is-expanded \false
						$back.animate {
							opacity: 0
						} 100ms \linear ->
							$back.css \display \none
				$button.click ->
					if ($image.attr \data-is-expanded) == \true
						$image.attr \data-is-expanded \false
						$back.animate {
							opacity: 0
						} 100ms \linear ->
							$back.css \display \none
					else
						$image.attr \data-is-expanded \true
						$back.css \display \block
						$back.animate {
							opacity: 1
						} 100ms \linear

			# Ajax setting of reply-form
			..find \.reply-form .submit (event) ->
				event.prevent-default!
				submit-reply!

			# Init favorite button
			..find 'article > .footer > .actions > .favorite > .favorite-button' .click ->
				$button = $ @
					..attr \disabled on
				if check-favorited!
					$status.attr \data-is-favorited \false
					$.ajax "#{config.web-api-url}/post/unfavorite" {
						type: \delete
						data: {'post-id': $status.attr \data-id}
						data-type: \json
						xhr-fields: {+withCredentials}}
					.done ->
						$button.attr \disabled off
					.fail ->
						$button.attr \disabled off
						$status.attr \data-is-favorited \true
				else
					$status.attr \data-is-favorited \true
					$.ajax "#{config.web-api-url}/status/favorite" {
						type: \post
						data: {'status-id': $status.attr \data-id}
						data-type: \json
						xhr-fields: {+withCredentials}}
					.done ->
						$button.attr \disabled off
					.fail ->
						$button.attr \disabled off
						$status.attr \data-is-favorited \false

			# Init reply button
			..find 'article > .footer > .actions > .reply > .reply-button' .click ->
				activate-display-state!

			# Init repost button
			..find 'article > .footer > .actions > .repost > .repost-button' .click ->
				if check-reposted!
					$post.attr \data-is-reposted \false
					$.ajax "#{config.web-api-url}/post/unrepost" {
						type: \delete
						data: {'post-id': $status.attr \data-id}
						data-type: \json
						xhr-fields: {+with-credentials}}
					.done ->
						$button.attr \disabled off
					.fail ->
						$button.attr \disabled off
						$status.attr \data-is-reposted \true
				else
					$post.find '.repost-form .background' .css \display \block
					$post.find '.repost-form .background' .animate {
						opacity: 1
					} 100ms \linear
					$post.find '.repost-form .form' .css \display \block
					$post.find '.repost-form .form' .animate {
						opacity: 1
					} 100ms \linear

			# Init repost form
			..find '.repost-form > .form' .submit (event) ->
				event.prevent-default!
				$form = $ @
				$submit-button = $form.find \.accept
					..attr \disabled on
					..attr \data-reposting \true
				$post.attr \data-is-reposted \true
				$.ajax "#{config.web-api-url}/posts/repost" {
					type: \post
					data:
						'post-id': $post.attr \data-id
					data-type: \json
					xhr-fields: {+with-credentials}}
				.done ->
					$submit-button
						..attr \disabled off
						..attr \data-reposting \false
					window.display-message 'Reposted!'
					$post.find '.repost-form .background' .animate {
						opacity: 0
					} 100ms \linear -> $post.find '.repost-form .background' .css \display \none
					$post.find '.repost-form .form' .animate {
						opacity: 0
					} 100ms \linear -> $post.find '.repost-form .form' .css \display \none
				.fail ->
					$submit-button
						..attr \disabled off
						..attr \data-reposting \false
					$post.attr \data-is-reposted \false
					window.display-message 'Repostに失敗しました。再度お試しください。'
			..find '.repost-form > .form > .actions > .cancel' .click ->
				$post.find '.repost-form .background' .animate {
					opacity: 0
				} 100ms \linear -> $post.find '.repost-form .background' .css \display \none
				$post.find '.repost-form .form' .animate {
					opacity: 0
				} 100ms \linear -> $post.find '.repost-form .form' .css \display \none
			..find '.repost-form .background' .click ->
				$post.find '.repost-form .background' .animate {
					opacity: 0
				} 100ms \linear -> $post.find '.repost-form .background' .css \display \none
				$post.find '.repost-form .form' .animate {
					opacity: 0
				} 100ms \linear -> $post.find '.repost-form .form' .css \display \none

			# Init ogp preview
			..find 'article > .main > .content > .text a' .each ->
				$link = $ @
				$.ajax "#{config.web-api-url}/web/ogp/parse" {
					type: \get
					data:
						'url': $link.attr \href
					data-type: \text
					xhr-fields: {+with-credentials}}
				.done (html) ->
					$ html .append-to $post.find 'article > .main > .content' .hide!.fade-in 200ms

	..add = ($post) ->
		new Audio '/resources/sounds/pop.mp3' .play!

		#$recent-status = ($ ($tl.children '.statuses' .children '.status')[0]) .children \.status
		#if ($recent-status.attr \data-display-html-is-active) == \true
		#	$status.children \.status .add-class \display-html-active-status-prev
		TIMELINE_CORE.set-event $post
		$post.prepend-to ((TIMELINE_CORE.tl.children '.posts')[0]) .hide!.slide-down 200ms

module.exports = TIMELINE_CORE
