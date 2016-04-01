require '../../home/script.ls'
$ = require 'jquery/dist/jquery'
Sortable = require 'Sortable'

function update-available-widgets-list
	$ \#customizer-available-widgets .empty!
	$ '#customizer-garbage-storage > .misskey-home-widget' .each ->
		$widget = $ @
		$item = $ '<option>'
		$item.attr \value $widget.attr \data-widget-id
		$item.text $widget.attr \data-widget-name
		$ \#customizer-available-widgets .append $item

$ ->
	$ \html .css {
		'user-select': 'none'
		'-moz-user-select': 'none'
		'-webkit-user-select': 'none'
		'-ms-user-select': 'none'
	}

	update-available-widgets-list!

	$ \#customizer-add-widget-button .click ->
		add-widget-id = $ \#customizer-available-widgets .val!
		$widget = ($ \#customizer-garbage-storage .find "[data-widget-id='#add-widget-id']").0
		$ \#left-contents .prepend $widget
		update-available-widgets-list!

	$ \#customizer-cancel-button .click ->
		document.location.href = '/'

	$ \#customizer-save-button .click ->
		$submit-button = $ \#customizer-save-button
		$submit-button.attr \disabled yes
		$submit-button.attr \value '保存中...'

		layout = {
			left: []
			center: []
			right: []
		}

		$ '#left-contents > .misskey-home-widget' .each ->
			$widget = $ @
			layout.left.push $widget.attr \data-widget-id
		$ '#main-contents > .misskey-home-widget' .each ->
			$widget = $ @
			layout.center.push $widget.attr \data-widget-id
		$ '#right-contents > .misskey-home-widget' .each ->
			$widget = $ @
			layout.right.push $widget.attr \data-widget-id

		$.ajax "#{CONFIG.web-api-url}/web/home-layout/update" {
			data:
				'layout': JSON.stringify layout}
		.done (data) ->
			document.location.href = '/'
		.fail (data) ->
			$submit-button.attr \disabled no
			$submit-button.attr \value '失敗'

	$ \.misskey-home-widget .each ->
		$widget = $ @
		$widget-lapper = $ '<div>' .attr {
			class: \misskey-home-widget-lapper
			title: $widget.attr \data-widget-name
		}

		if ($widget.attr \data-widget-not-allow-remove) != \true
			$widget-remove-button = $ '<button><i class="fa fa-times"></button>' .attr {
				title: 'このウィジェットをリムーブ'
			}

			$widget-remove-button.click ->
				$ \#customizer-garbage-storage .append $widget
				update-available-widgets-list!

			$widget-lapper.append $widget-remove-button

		$widget-caption = $ '<p class="caption">' .text $widget.attr \data-widget-name
		$widget-lapper.append $widget-caption
		$widget.append $widget-lapper

	Sortable.create ($ '#left-contents')[0], {
		group: \contents
		animation: 300ms
	}

	Sortable.create ($ '#main-contents')[0], {
		group: \contents
		animation: 300ms
	}

	Sortable.create ($ '#right-contents')[0], {
		group: \contents
		animation: 300ms
	}
