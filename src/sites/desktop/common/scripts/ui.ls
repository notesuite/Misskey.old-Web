$ = require 'jquery/dist/jquery'
require 'jquery.transit'
moment = require 'moment'
Sortable = require 'Sortable'
require 'fuck-adblock'

require './main.js'
require '../../../common/kronos.js'
Tab = require './lib/tab.js'
WavesEffect = require './lib/waves-effect.js'
AlbumWindow = require './album-window.js'
upload-file = require '../../../common/upload-file.js'
sncompleter = require './sncompleter.js'
show-modal-window = require './modal-window.js'
show-modal-dialog = require './modal-dialog.js'
ui-window = require './window.js'
notifications-compiler = require '../../common/views/notification/smart/items.jade'

album = new AlbumWindow

window.is-keyboard-shortcuts-open = no

if fuck-ad-block == undefined
	ad-block-detected!
else
	fuck-ad-block.on-detected ad-block-detected

function ad-block-detected
	$modal-ok = $ '<button>了解</button>'
	dialog-close = show-modal-dialog do
		$ '<p><i class="fa fa-exclamation-triangle"></i>広告ブロッカーが有効です</p>'
		'広告ブロッカー(もしくはリソースの読み込みを妨げる何らかの機能)がはたらいています。
		<strong>Misskeyは広告を掲載していません</strong>が、広告ブロッカーが有効だと一部の機能が利用できない場合があります(ユーザーのフォローが出来ないなど)。
		Misskeyを快適にご利用いただくためには、広告ブロッカーを無効にしてください。'
		[$modal-ok]
	$modal-ok.click -> dialog-close!

################################

$ ->
	if not NOUI
		init-header!
		$ \body .css \margin-top "#{$ 'body > #misskey-header' .outer-height!}px"

	if LOGIN
		post-form = new PostForm

		update-header-statuses!
		set-interval update-header-statuses, 10000ms

	$ document .keypress (e) ->
		tag = e.target.tag-name.to-lower-case!
		if tag != \input and tag != \textarea
			# Short cut Help
			if e.which == 47 or e.which == 104
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
			# Open post form
			if e.which == 110 or e.which == 112
				e.prevent-default!
				post-form.open!

	$ document .keydown (e) ->
		if e.which == 27
			e.prevent-default!
			post-form.close!

$ window .load ->
	if not NOUI
		$ \body .css \margin-top "#{$ 'body > #misskey-header' .outer-height!}px"

	WavesEffect.attach-to-class \ui-waves-effect

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

window.open-select-album-file-dialog = (cb) ->
	album.choose-file cb

function init-header
	update-header-clock!
	set-interval update-header-clock, 1000ms

	# 「Misskey Menu」ドロップダウン
	$ '#misskey-header .misskey-menu .dropdown .dropdown-header' .click ->
		$dropdown = $ '#misskey-header .misskey-menu .dropdown'

		function close
			$dropdown.attr \data-active \false

		function open
			$ document .click (e) ->
				if !$.contains $dropdown[0], e.target
					close!
			$dropdown.attr \data-active \true

		if ($dropdown.attr \data-active) == \true
			close!
		else
			open!

	# Talks
	$ '#misskey-header > .main .main-contents-container .left nav .main-nav ul .talks a' .click ->
		window-id = "misskey-window-talk-histories"
		$content = $ '<iframe>' .attr {src: CONFIG.talk-url, +seamless}
		ui-window do
			window-id
			$content
			"<i class=\"fa fa-comments\"></i>トーク"
			500px
			560px
			yes
		false

	# 「アカウント」ドロップダウン
	$ '#misskey-header .account .dropdown .dropdown-header' .click ->
		$dropdown = $ '#misskey-header .account .dropdown'

		function close
			$dropdown.attr \data-active \false
			$dropdown.find 'i.fa.fa-angle-up' .attr \class 'fa fa-angle-down'

		function open
			$ document .click (e) ->
				if !$.contains $dropdown[0], e.target
					close!
			$dropdown.attr \data-active \true
			$dropdown.find 'i.fa.fa-angle-down' .attr \class 'fa fa-angle-up'

		if ($dropdown.attr \data-active) == \true
			close!
		else
			open!

	# 通知全削除ﾎﾞﾔﾝ
	$ '#misskey-header .notifications .delete-all-button' .click ->
		$ '#misskey-header .notifications .notification' .each (i) ->
			$notification = $ @
			set-timeout ->
				$notification.transition {
					perspective: \4096px
					rotate-x: \90
					opacity: \0
				} 200ms \ease ->
					$message.remove!
			, i * 50

		$.ajax CONFIG.web-api-url + '/notification/delete-all'
		.done (data) ->
			$ '#misskey-header .notifications .unread-count' .remove!
			$list = $ '<ol class="notifications" />'
			$info = $ '<p class="notification-empty">通知はありません</p>'
			$info.append-to $notifications-container
		.fail (data) ->

	# Notifications drop-down
	$ '#misskey-header .notifications .dropdown .dropdown-header' .click ->
		$dropdown = $ '#misskey-header .notifications .dropdown'

		function close
			$dropdown.attr \data-active \false
			$ '#misskey-header .notifications .dropdown .dropdown-content .main' .empty!

		function open
			$ document .click (e) ->
				if !$.contains $dropdown[0], e.target
					close!
			$dropdown.attr \data-active \true

			$notifications-container = $ '#misskey-header .notifications .dropdown .dropdown-content .main'
				..append $ '
			<div class="loading">
				<div class="bounce1"></div>
				<div class="bounce2"></div>
				<div class="bounce3"></div>
			</div>'

			# 通知読み込み
			$.ajax "#{CONFIG.web-api-url}/notifications/timeline"
			.done (notifications) ->
				$ '#misskey-header .notifications .loading' .remove!
				$ '#misskey-header .notifications .unread-count' .remove!
				$list = $ '<ol class="notifications" />'
				if notifications != []
					$ '#misskey-header .notifications .nav' .css \display \block
					$ '#misskey-header .notifications .main' .css \margin-top \32px
					$notifications = $ notifications-compiler {
						items: notifications
						config: CONFIG
						me: ME
					}
					$list.append $notifications
					$ '#misskey-header .notifications .main' .append $list
				else
					$info = $ '<p class="notifications-empty">通知はありません</p>'
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

		$global-container = $ 'body > .global-container'
		$ {blur-radius: 0} .animate {blur-radius: 5}, {
			duration: 100ms
			easing: \linear
			step: ->
				$global-container.css {
					'-webkit-filter': "blur(#{@blur-radius}px)"
					'filter': "blur(#{@blur-radius}px)"
				}
		}

		THIS.status-post-form.focus!
		THIS.active-tab = \status

	close: ->
		THIS = @
		THIS.is-open = no

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

		$global-container = $ 'body > .global-container'
		$ {blur-radius: 5} .animate {blur-radius: 0}, {
			duration: 100ms
			easing: \linear
			step: ->
				$global-container.css {
					'-webkit-filter': "blur(#{@blur-radius}px)"
					'filter': "blur(#{@blur-radius}px)"
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
			items = (event.clipboard-data || event.original-event.clipboard-data).items
			for i from 0 to items.length - 1
				item = items[i]
				if item.kind == \file && item.type.index-of \image != -1
					file = item.get-as-file!
					THIS.post-form.photo-post-form.upload-new-file file

		THIS.$form.find '.attach-from-album' .click ->
			window.open-select-album-file-dialog (files) ->
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

function update-header-statuses
	$.ajax "#{CONFIG.web-api-url}/posts/timeline/unread/count"
	.done (data) ->
		$ '#misskey-header .home a .unread-count' .remove!
		if data != 0
			$ '#misskey-header .home a' .append $ "<span class=\"unread-count\">#{data}</span>"

	$.ajax "#{CONFIG.web-api-url}/posts/mentions/unread/count"
	.done (data) ->
		$ '#misskey-header .mentions a .unread-count' .remove!
		if data != 0
			$ '#misskey-header .mentions a' .append $ "<span class=\"unread-count\">#{data}</span>"

	$.ajax "#{CONFIG.web-api-url}/talks/messages/unread/count"
	.done (data) ->
		$ '#misskey-header .talks a .unread-count' .remove!
		if data != 0
			$ '#misskey-header .talks a' .append $ "<span class=\"unread-count\">#{data}</span>"

	$.ajax "#{CONFIG.web-api-url}/notifications/unread/count"
	.done (data) ->
		$ '#misskey-header .notifications .dropdown .dropdown-header p .unread-count' .remove!
		if data != 0
			$ '#misskey-header .notifications .dropdown .dropdown-header p' .append $ "<span class=\"unread-count\">#{data}</span>"

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
