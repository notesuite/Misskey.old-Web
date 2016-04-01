$ = require 'jquery/dist/jquery'
require 'jquery.transit'
moment = require 'moment'
Sortable = require 'Sortable'
require 'fuck-adblock'

require './main.js'
require '../../../common/kronos.ls'
Tab = require './lib/tab.js'
WavesEffect = require './lib/waves-effect.js'
AlbumDialog = require './album-dialog.ls'
upload-file = require '../../../common/upload-file.ls'
sncompleter = require './sncompleter.ls'
show-modal-window = require './modal-window.ls'
show-modal-dialog = require './modal-dialog.ls'
ui-window = require './window.ls'
notifications-compiler = require '../../common/views/notification/smart/items.jade'

window.is-keyboard-shortcuts-open = no

if fuck-ad-block == undefined
	ad-block-detected!
else
	fuck-ad-block.on-detected ad-block-detected

function ad-block-detected
	$modal-ok = $ "<button>#{LOCALE.sites.desktop.common.ad_block_detected.ok}</button>"
	dialog-close = show-modal-dialog do
		$ "<p><i class=\"fa fa-exclamation-triangle\"></i>#{LOCALE.sites.desktop.common.ad_block_detected.title}</p>"
		LOCALE.sites.desktop.common.ad_block_detected.text
		[$modal-ok]
	$modal-ok.click -> dialog-close!

################################

$ ->
	if NOUI
		$ \body .css \margin-top 0
	else
		init-header!
		$ \body .css \margin-top "#{$ '#misskey-header' .outer-height!}px"

	if LOGIN
		post-form = new PostForm

		$.ajax "#{CONFIG.web-api-url}/posts/timeline/unread/count"
		.done (count) ->
			$ '#misskey-header .home a .unread-count' .remove!
			if count != 0
				$ '#misskey-header .home a' .append $ "<span class=\"unread-count\">#{count}</span>"

		$.ajax "#{CONFIG.web-api-url}/posts/mentions/unread/count"
		.done (count) ->
			$ '#misskey-header .mentions a .unread-count' .remove!
			if count != 0
				$ '#misskey-header .mentions a' .append $ "<span class=\"unread-count\">#{count}</span>"

		$.ajax "#{CONFIG.web-api-url}/talks/messages/unread/count"
		.done (count) ->
			$ '#misskey-header .talks a .unread-count' .remove!
			if count != 0
				$ '#misskey-header .talks a' .append $ "<span class=\"unread-count\">#{count}</span>"

		$.ajax "#{CONFIG.web-api-url}/notifications/unread/count"
		.done (count) ->
			$ '#misskey-header .notifications .header span .unread-count' .remove!
			if count != 0
				$ '#misskey-header .notifications .header span' .append $ "<span class=\"unread-count\">#{count}</span>"

	$ \#misskey-go-top-button .click ->
		$ 'html, body' .animate {
			scroll-top: 0
		} 300ms \swing

	$ document .keypress (e) ->
		tag = e.target.tag-name.to-lower-case!
		if tag != \input and tag != \textarea
			switch (e.which)
			| 47, 104 => # Short cut Help
				e.prevent-default!
				if window.is-keyboard-shortcuts-open
					window.keyboard-shortcuts-closer!
				else
					window.is-keyboard-shortcuts-open = yes
					window.keyboard-shortcuts-closer = show-modal-window do
						$ '#misskey-keyboard-shortcuts > *' .clone!
						true
						null
						\misskey-keyboard-shortcuts
						->
							window.is-keyboard-shortcuts-open = no
			| 110, 112 => # Open post form
				e.prevent-default!
				post-form.open!
			| 109 =>
				e.prevent-default!
				toggle-misskey-menu!

$ window .on 'load scroll resize' on-scroll

$ window .load ->
	if not NOUI
		$ \body .css \margin-top "#{$ \#misskey-header .outer-height!}px"

	WavesEffect.attach-to-class \ui-waves-effect

function on-scroll
	t = $ window .scroll-top!
	opacity = t / 128
	if opacity > 0.3 then opacity = 0.3
	$ \#misskey-header .css \box-shadow "0 0 1px rgba(0, 0, 0, #{opacity})"

	if t > 500px
		$ \#misskey-go-top-button .remove-class \hidden
	else
		$ \#misskey-go-top-button .add-class \hidden

################################

window.display-message = (message) ->
	$message = $ '<p class="ui-message">' .text message
	$ \body .prepend $message
	$message.transition {
		opacity: \1
		perspective: \1024
		rotate-x: \0
	} 200ms \ease
	set-timeout ->
		$message.transition {
			opacity: \0
			perspective: \1024
			rotate-x: \90
		} 200ms \ease ->
			$message.remove!
	, 5000ms

function toggle-misskey-menu
	$button = $ '#misskey-header .misskey-menu .hamburger'

	function close
		$button.attr \data-active \false
		$ \#misskey-menu .css \left \-400px
		$ '#misskey-menu > .body' .css \left \-400px
		$ \#misskey-menu-bg .attr \data-show \false

	function open
		$ \#misskey-menu-bg .one \click (e) ->
			close!
		$button.attr \data-active \true
		$ \#misskey-menu .css \left \0
		$ \#misskey-menu-bg .attr \data-show \true
		set-timeout do
			-> $ '#misskey-menu > .body' .css \left \0
			100ms

	if ($button.attr \data-active) == \true
		close!
	else
		open!

function init-header
	update-header-clock!
	set-interval update-header-clock, 1000ms

	# 「Misskey Menu」ドロップダウン
	$ '#misskey-header .misskey-menu .hamburger' .click ->
		toggle-misskey-menu!

	# Talks
	$ '#misskey-header > .main .main-contents-container .left nav .main-nav ul .talks a' .click ->
		$content = $ '<iframe>' .attr {src: CONFIG.talk-url, +seamless}
		ui-window do
			$content
			"<i class=\"fa fa-comments\"></i>#{LOCALE.sites.desktop.common.talk_window_title}"
			500px
			560px
			yes
		false

	# Account dropdown
	$ '#misskey-header .account .body' .css \top "-#{$ '#misskey-header .account .body' .outer-height! - $ \#misskey-header .outer-height!}px"
	$ '#misskey-header .account' .click ->
		$dropdown = $ '#misskey-header .account'

		function close
			$dropdown.attr \data-active \false
			$dropdown.find 'button i.fa.fa-angle-up' .attr \class 'fa fa-angle-down'
			$dropdown.find '.body' .css \top "-#{$dropdown.find '.body' .outer-height! - $ \#misskey-header .outer-height!}px"
			$dropdown.find '.bg' .attr \data-show \false

		function open
			$dropdown.find '.body' .css \display \block
			$dropdown.attr \data-active \true
			$dropdown.find 'button i.fa.fa-angle-down' .attr \class 'fa fa-angle-up'
			$dropdown.find '.body' .css \top ($ \#misskey-header .outer-height!)
			$dropdown.find '.bg' .attr \data-show \true

		if ($dropdown.attr \data-active) == \true
			close!
		else
			open!

	# 通知全削除
	$ '#misskey-header .notifications .delete-all-button' .click ->
		notification-delete-all!

	# Notifications drop-down
	$ '#misskey-header .notifications .header' .click ->
		$dropdown = $ '#misskey-header .notifications'

		function close
			$dropdown.attr \data-active \false
			$ '#misskey-header .notifications .body .main' .empty!

		function open
			$ document .click (e) ->
				if !$.contains $dropdown[0], e.target
					close!
			$dropdown.attr \data-active \true

			$notifications-container = $ '#misskey-header .notifications .body .main'
				..append $ '
			<div class="loading">
				<div class="bounce1"></div>
				<div class="bounce2"></div>
				<div class="bounce3"></div>
			</div>'

			# 通知読み込み
			$.ajax "#{CONFIG.web-api-url}/notifications/timeline"
			.done (notifications) ->
				$ '#misskey-header .notifications .body .loading' .remove!
				$ '#misskey-header .notifications .unread-count' .remove!
				$list = $ '<ol class="notifications" />'
				if notifications != []
					$ '#misskey-header .notifications .body .nav' .css \display \block
					$ '#misskey-header .notifications .body .main' .css \margin-top \32px
					$notifications = $ notifications-compiler {
						items: notifications
						config: CONFIG
						locale: LOCALE
						user-settings: USER_SETTINGS
						me: ME
					}
					$list.append $notifications
					$ '#misskey-header .notifications .main' .append $list
				else
					$info = $ "<p class=\"notifications-empty\">#{LOCALE.common.empty_notifications}</p>"
					$info.append-to $notifications-container
			.fail (data) ->
				$ '#misskey-header .notifications .loading' .remove!

		if ($dropdown.attr \data-active) == \true
			close!
		else
			open!

	$ '#misskey-header .search input' .bind \input ->
		$input = $ @
		$result = $ '#misskey-header .search .result'
		if $input .val! == ''
			$input.attr \data-active \false
			$result.empty!
		else
			$input.attr \data-active \true
			$.ajax "#{CONFIG.web-api-url}/users/search" {
				data: {'query': $input .val!}
			} .done (result) ->
				$result.empty!
				if (result.length > 0) && ($input .val! != '')
					$result.append $ '<ol class="users">'
					result.for-each (user) ->
						$result.find \ol .append do
							$ \<li> .append do
								$ '<a class="ui-waves-effect">' .attr {
									'href': "#{CONFIG.url}/#{user.screen-name}"
									'title': user.comment}
								.append do
									$ '<img class="avatar" alt="avatar">' .attr \src user.avatar-thumbnail-url
								.append do
									$ '<span class="name">' .text user.name
								.append do
									$ '<span class="screen-name">' .text "@#{user.screen-name}"

function notification-delete-all
	$i = $ '#misskey-header .notifications .delete-all-button > i'
		..attr \class 'fa fa-spinner fa-spin'
	$modal-ok = $ "<button>#{LOCALE.sites.desktop.common.delete_all_notifications_flow.confirmation_dialog.ok}</button>"
	$modal-cancel = $ "<button>#{LOCALE.sites.desktop.common.delete_all_notifications_flow.confirmation_dialog.cancel}</button>"
	dialog-close = show-modal-dialog do
		$ "<p><i class=\"fa fa-exclamation-triangle\"></i>#{LOCALE.sites.desktop.common.delete_all_notifications_flow.confirmation_dialog.title}</p>"
		LOCALE.sites.desktop.common.delete_all_notifications_flow.confirmation_dialog.text
		[$modal-cancel, $modal-ok]
		no
	$modal-cancel.click ->
		dialog-close!
		$i.attr \class 'fa fa-trash-o'
	$modal-ok.click ->
		dialog-close!
		$.ajax "#{CONFIG.web-api-url}/notifications/unread/count"
		.done (count) ->
			if count != 0
				$modal-ok = $ "<button>#{LOCALE.sites.desktop.common.delete_all_notifications_flow.re_confirmation_dialog.ok}</button>"
				$modal-cancel = $ "<button>#{LOCALE.sites.desktop.common.delete_all_notifications_flow.re_confirmation_dialog.cancel}</button>"
				dialog-close = show-modal-dialog do
					$ "<p><i class=\"fa fa-exclamation-triangle\"></i>#{LOCALE.sites.desktop.common.delete_all_notifications_flow.re_confirmation_dialog.title}</p>"
					LOCALE.sites.desktop.common.delete_all_notifications_flow.re_confirmation_dialog.text
					[$modal-cancel, $modal-ok]
					no
				$modal-cancel.click ->
					dialog-close!
					$i.attr \class 'fa fa-trash-o'
				$modal-ok.click ->
					dialog-close!
					del!
			else
				del!
		.fail ->
			$i.attr \class 'fa fa-trash-o'
			alert '削除の準備に失敗しました。再度お試しください。'

	function del
		$.ajax "#{CONFIG.web-api-url}/notifications/delete-all"
		.done ->
			$i.attr \class 'fa fa-trash-o'
			$ '#misskey-header .notifications .unread-count' .remove!
			$ '#misskey-header .notifications .main' .html '<p class="notification-empty">通知はありません</p>'
		.fail ->
			$i.attr \class 'fa fa-trash-o'
			alert '削除に失敗しました。再度お試しください。'

class PostForm
	->
		THIS = @

		THIS.is-open = no

		THIS.status-post-form = new StatusPostForm THIS

		THIS.tab = Tab do
			$ '#misskey-post-form-tabs'
			$ '#misskey-post-form-tab-pages'
			(id) ->
				switch (id)
				| \status => THIS.status-post-form.focus!

		$ \#misskey-post-button .click ->
			THIS.open!
		$ \#misskey-post-form .click (e) ->
			e.stop-propagation!
		$ \#misskey-post-form-container .click ->
			THIS.close!
		$ \#misskey-post-form .find \.close-button .click ->
			THIS.close!

	open: ->
		THIS = @

		if THIS.is-open
			return

		THIS.is-open = yes

		$ \#misskey-post-form-back .css {
			'display': \block
			'pointer-events': ''
		}
		$ \#misskey-post-form-back .animate {
			opacity: 1
		} 100ms \linear
		$ \#misskey-post-form-container .css {
			'display': \block
			'pointer-events': ''
		}
		$ \#misskey-post-form .stop!
		$ \#misskey-post-form .css \transform 'scale(1.2)'
		$ \#misskey-post-form .transition {
			opacity: \1
			scale: \1
		} 1000ms 'cubic-bezier(0, 1, 0, 1)'
		$ \#misskey-post-form-tabs .find \li .each (i) ->
			$tab = $ @
			$tab.find \i .css \transition \none
			$tab.find \i .css {
				top: \-16px
				opacity: 0
			}
			set-timeout ->
				$tab.find \i .css \transition 'top 0.3s ease-out, opacity 0.3s ease-out'
				$tab.find \i .css {
					top: \0px
					opacity: 1
				}
				set-timeout ->
					$tab.find \i .css {
						transition: ''
						top: ''
					}
				, 300ms
			, i * 50

		$contents = $ \#misskey-global
		$ {blur-radius: 0} .animate {blur-radius: 5}, {
			duration: 100ms
			easing: \linear
			step: ->
				$contents.css {
					'-webkit-filter': "blur(#{@blur-radius}px)"
					'-moz-filter': "blur(#{@blur-radius}px)"
					'filter': "blur(#{@blur-radius}px)"
				}
		}

		THIS.status-post-form.focus!
		THIS.active-tab = \status

		$ document .on \keydown.post-form-close (e) ->
			# ESC Close
			if e.which == 27
				e.prevent-default!
				THIS.close!

	close: ->
		THIS = @
		THIS.is-open = no

		$ document .off \keydown.post-form-close

		$ \#misskey-post-form-back .css \pointer-events \none
		$ \#misskey-post-form-back .animate {
			opacity: 0
		} 100ms \linear -> $ \#misskey-post-form-back .css \display \none
		$ \#misskey-post-form-container .css \pointer-events \none
		$ \#misskey-post-form .stop!
		$ \#misskey-post-form .transition {
			opacity: \0
			scale: \0.8
		} 1000ms 'cubic-bezier(0, 1, 0, 1)' ->
			if ($ \#misskey-post-form .css \opacity) === '0'
				$ \#misskey-post-form-container .css \display \none

		$contents = $ \#misskey-global
		$ {blur-radius: 5} .animate {blur-radius: 0}, {
			duration: 100ms
			easing: \linear
			step: ->
				$contents.css {
					'-webkit-filter': "blur(#{@blur-radius}px)"
					'-moz-filter': "blur(#{@blur-radius}px)"
					'filter': "blur(#{@blur-radius}px)"
				}
			complete: ->
				$contents.css {
					'-webkit-filter': ""
					'-moz-filter': ""
					'filter': ""
				}
		}

class StatusPostForm
	(post-form) ->
		THIS = @
		THIS.post-form = post-form

		THIS.$form = $ '#misskey-post-form-status-tab-page'
		THIS.$textarea = THIS.$form.find 'textarea'
		THIS.$submit-button = THIS.$form.find '[type=submit]'

		Sortable.create (THIS.$form.find '.photos')[0], {
			animation: 150ms
		}

		sncompleter THIS.$textarea

		THIS.$textarea.bind \input ->
			$ \#misskey-post-form .find \.submit-button .attr \disabled off

		THIS.$textarea.keypress (e) ->
			if (e.char-code == 10 || e.char-code == 13) && e.ctrl-key
				THIS.submit!

		THIS.$textarea.on \paste (event) ->
			PASTE = @
			data = event.original-event.clipboard-data
			items = data.items
			for i from 0 to items.length - 1
				item = items[i]
				switch (item.kind)
					| \file =>
						file = item.get-as-file!
						THIS.upload-file file

		THIS.$form.find '.attach-from-album' .click ->
			album = new AlbumDialog
			album.choose-file (files) ->
				files.for-each (file) ->
					THIS.add-file file

		THIS.$form.find '.attach-from-local' .click ->
			THIS.$form.find 'input[type=file]' .click!
			return false

		THIS.$form.find 'input[type=file]' .change ->
			files = (THIS.$form.find 'input[type=file]')[0].files
			for i from 0 to files.length - 1
				file = files.item i
				THIS.upload-file file

		THIS.$form.submit (event) ->
			event.prevent-default!
			THIS.submit!

	upload-file: (file) ->
		THIS = @
		name = if file.has-own-property \name then file.name else 'untitled'
		$info = $ "<li><p class='name'>#{name}</p><progress></progress></li>"
		$progress = $info.find \progress
		THIS.$form.find '> .uploads' .append $info
		upload-file do
			file
			null
			$progress
			null
			(file) ->
				$info.remove!
				THIS.add-file file
			->
				$info.remove!

	add-file: (file) ->
		THIS = @
		$thumbnail = $ "<li style='background-image: url(#{file.thumbnail-url});' data-id='#{file.id}' />"
		$remove-button = $ '<button class="remove" title="添付を取り消し"><img src="' + CONFIG.resources-url + '/desktop/common/images/delete.png" alt="remove"></button>'
		$thumbnail.append $remove-button
		$remove-button.click ->
			$thumbnail.remove!
		THIS.$form.find '.photos' .append $thumbnail

	submit: ->
		THIS = @

		THIS.$submit-button.attr \disabled on
		THIS.$submit-button.add-class \updating
		THIS.$submit-button.find \p .text 'Updating'
		THIS.$submit-button.find \i .attr \class 'fa fa-spinner fa-pulse'

		file-ids = (THIS.$form.find '.photos > li' .map ->
			$ @ .attr \data-id).get!

		$.ajax "#{CONFIG.web-api-url}/posts/create", { data: {
			'text': THIS.$form.find \textarea .val!
			'files': file-ids.join \,
		}}
		.done (data) ->
			window.display-message '投稿しました！'
			THIS.$submit-button.find \p .text 'Update'
			THIS.$submit-button.find \i .attr \class 'fa fa-paper-plane'
			THIS.post-form.close!
			THIS.$form[0].reset!
			THIS.$form.find '.photos' .empty!
		.fail (err, text-status) ->
			console.error err, text-status
			window.display-message '投稿に失敗しました。'
			THIS.$submit-button.find \p .text 'Re Update'
			THIS.$submit-button.find \i .attr \class 'fa fa-repeat'
		.always ->
			THIS.$submit-button.attr \disabled off
			THIS.$submit-button.remove-class \updating

	focus: ->
		THIS = @
		THIS.post-form.tab.select \status no
		THIS.post-form.active-tab = \status
		$ \#misskey-post-form-status-tab-page .find \textarea .focus!

function update-header-clock
	s = (new Date!).get-seconds!
	m = (new Date!).get-minutes!
	h = (new Date!).get-hours!
	yyyymmdd = moment!.format 'YYYY/MM/DD'
	yyyymmdd = "<span class='yyyymmdd'>#yyyymmdd</span>"
	hhmm = moment!.format 'HH:mm'
	if s % 2 == 0
		hhmm .= replace \: '<span style=\'visibility:visible\'>:</span>'
	else
		hhmm .= replace \: '<span style=\'visibility:hidden\'>:</span>'
	clock = $ '#misskey-header .time .now'
	clock.html "#yyyymmdd<br>#hhmm"

	# DRAW CLOCK
	vec2 = (x, y) ->
		@.x = x
		@.y = y

	canvas = document.get-element-by-id \misskey-main-clock-canvas
	ctx = canvas.get-context \2d
	canv-w = canvas.width
	canv-h = canvas.height
	ctx.clear-rect 0, 0, canv-w, canv-h

	# 背景
	center = (Math.min (canv-w / 2), (canv-h / 2))
	line-start = center * 0.90
	line-end-short = center * 0.87
	line-end-long = center * 0.84
	for i from 0 to 59 by 1
		angle = Math.PI * i / 30
		uv = new vec2 (Math.sin angle), (-Math.cos angle)
		ctx.begin-path!
		ctx.line-width = 1
		ctx.move-to do
			(canv-w / 2) + uv.x * line-start
			(canv-h / 2) + uv.y * line-start
		if i % 5 == 0
			ctx.stroke-style = 'rgba(255, 255, 255, 0.2)'
			ctx.line-to do
				(canv-w / 2) + uv.x * line-end-long
				(canv-h / 2) + uv.y * line-end-long
		else
			ctx.stroke-style = 'rgba(255, 255, 255, 0.1)'
			ctx.line-to do
				(canv-w / 2) + uv.x * line-end-short
				(canv-h / 2) + uv.y * line-end-short
		ctx.stroke!

	# 分
	angle = Math.PI * (m + s / 60) / 30
	length = (Math.min canv-w, canv-h) / 2.6
	uv = new vec2 (Math.sin angle), (-Math.cos angle)
	ctx.begin-path!
	ctx.stroke-style = \#ffffff
	ctx.line-width = 2
	ctx.move-to do
		(canv-w / 2) - uv.x * length / 5
		(canv-h / 2) - uv.y * length / 5
	ctx.line-to do
		(canv-w / 2) + uv.x * length
		(canv-h / 2) + uv.y * length
	ctx.stroke!

	# 時
	angle = Math.PI * (h % 12 + m / 60) / 6
	length = (Math.min canv-w, canv-h) / 4
	uv = new vec2 (Math.sin angle), (-Math.cos angle)
	ctx.begin-path!
	#ctx.stroke-style = \#ffffff
	ctx.stroke-style = CONFIG.theme-color
	ctx.line-width = 2
	ctx.move-to do
		(canv-w / 2) - uv.x * length / 5
		(canv-h / 2) - uv.y * length / 5
	ctx.line-to do
		(canv-w / 2) + uv.x * length
		(canv-h / 2) + uv.y * length
	ctx.stroke!

	# 秒
	angle = Math.PI * s / 30
	length = (Math.min canv-w, canv-h) / 2.6
	uv = new vec2 (Math.sin angle), (-Math.cos angle)
	ctx.begin-path!
	ctx.stroke-style = 'rgba(255, 255, 255, 0.5)'
	ctx.line-width = 1
	ctx.move-to do
		(canv-w / 2) - uv.x * length / 5
		(canv-h / 2) - uv.y * length / 5
	ctx.line-to do
		(canv-w / 2) + uv.x * length
		(canv-h / 2) + uv.y * length
	ctx.stroke!
