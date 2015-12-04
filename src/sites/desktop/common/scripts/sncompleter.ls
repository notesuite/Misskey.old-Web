$ = require 'jquery'

``
$.fn.selectRange = function(start, end) {
    if(typeof end === 'undefined') {
        end = start;
    }
    return this.each(function() {
        if('selectionStart' in this) {
            this.selectionStart = start;
            this.selectionEnd = end;
        } else if(this.setSelectionRange) {
            this.setSelectionRange(start, end);
        } else if(this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};
``

module.exports = ($input) ->
	$opening-menu = null
	caret = null

	function get-caret
		selection-start = $input[0].selection-start
		selection-end = $input[0].selection-end
		selection-start

	function complete(summoner, value)
		close!
		source = $input.val!
		before = source.substring 0 caret
		trimed-before = before.substring 0 before.last-index-of summoner
		after = source.substring caret
		$input.val trimed-before + summoner + value + ' ' + after
		$input.focus!
		$input.select-range caret + value.length

	function open
		styles = <[
			border-bottom-width
			border-left-width
			border-right-width
			border-top-width
			font-family
			font-size
			font-style
			font-variant
			font-weight
			letter-spacing
			word-spacing
			line-height
			padding-bottom
			padding-left
			padding-right
			padding-top
			text-decoration
		]>

		caret := get-caret!
		text = $input.val!.substring 0 caret

		$dummy-input = $ '<div role="presentation" />'
			..css {
				'position': \absolute
				'top': \0
				'left': \0
				'pointer-events': \none
				'visibility': \hidden
				'width': $input.width! + 'px'
				'height': $input.height! + 'px'
			}

		styles.for-each (style) ->
			$dummy-input.css style, $input.css style

		$ \body .append $dummy-input

		$dummy-text = $ '<span />'

		$dummy-text-positioner = $ '<span />'
			..html '&nbsp;'

		$dummy-input.append $dummy-text
		$dummy-input.append $dummy-text-positioner

		$dummy-text.text text
		$dummy-text.html $dummy-text.text!.replace /(\r\n|\r|\n)/g '<br>'
		$dummy-input[0].scroll-top = $dummy-input[0].scroll-height
		$dummy-input.css {
			'width': $input.width! + 'px'
			'height': $input.height! + 'px'
		}

		input-position = $input.position!
		caret-position = $dummy-text-positioner.position!

		if $opening-menu?
			$opening-menu.css {
				'position': \absolute
				'top': (input-position.top + caret-position.top) + 'px'
				'left': (input-position.left + caret-position.left) + 'px'
			}
			$opening-menu.attr \data-select \null
			$opening-menu
		else
			$input.bind \keydown autocomplate-keydown
			$menu = $ '<div class="ui-autocomplete" data-select="null" />'
			$menu.css {
				'position': \absolute
				'top': (input-position.top + caret-position.top) + 'px'
				'left': (input-position.left + caret-position.left) + 'px'
			}
			$opening-menu := $menu
			$input.parent!.append $menu
			$menu

	function close
		$opening-menu := null
		$input.parent!.children \.ui-autocomplete .remove!
		$input.unbind \keydown autocomplate-keydown

	function autocomplate-keydown(e)
		select = $opening-menu.attr \data-select
		if select == \null
			select = null
		else
			select = Number select
		key = e.keyCode || e.which
		switch (key)
			| 10, 13 => # Key[ENTER]
				if select?
					e.prevent-default!
					$a = $opening-menu.find "ol > li:nth-child(#{$opening-menu.attr 'data-select'}) > a"
					complete ($a.attr \data-summoner), ($a.attr \data-value)
				else
					close!
					$input.focus!
			| 27 => # Key[ESC]
				e.prevent-default!
				e.stop-propagation!
				close!
				$input.focus!
			| 38 => # Key[↑]
				e.prevent-default!
				if select == null or select == 1
					$opening-menu.attr \data-select ($opening-menu.find \ol .children!.length)
				else
					$opening-menu.attr \data-select select - 1
			| 9, 40 => # Key[TAB] or Key[↓]
				e.prevent-default!
				if select == null or select == ($opening-menu.find \ol .children!.length)
					$opening-menu.attr \data-select 1
				else
					$opening-menu.attr \data-select select + 1
			| _ =>
				$input.focus!
				return
		if $opening-menu?
			$opening-menu.find "ol > li:nth-child(#{$opening-menu.attr 'data-select'}) > a" .focus!

	$input.bind \input ->
		caret := get-caret!
		text = $input.val!.substring 0 caret

		id-at-index = text.last-index-of \@
		hash-index = text.last-index-of \#

		if id-at-index != -1
			sn = (text.substring id-at-index).replace \@ ''
			if sn.length > 0 and sn.match /^[a-zA-Z0-9_\-]+$/
				$menu = open!

				# search users
				$.ajax "#{config.web-api-url}/users/search-by-screen-name" {
					data: {'screen-name': sn}
					data-type: \json}
				.done (result) ->
					if result? and result.length > 0
						$menu.empty!
						$menu.append $ '<ol class="users">'
						result.for-each (user) ->
							$menu.children \ol .append do
								$ \<li> .append do
									$ '<a class="ui-waves-effect">' .attr {
										'href': "#{config.url}/#{user.screen-name}"
										'title': user.comment
										'data-summoner': \@
										'data-value': user.screen-name}
									.bind \keydown autocomplate-keydown
									.click ->
										complete \@ user.screen-name
										false
									.append do
										$ '<img class="avatar" alt="avatar">' .attr \src user.avatar-url
									.append do
										$ '<span class="name">' .text user.name
									.append do
										$ '<span class="screen-name">' .text "@#{user.screen-name}"
					else
						close!
				return
			else
				close!

		if hash-index != -1
			if hash-index == 0 or text[hash-index - 1] == ' ' or text[hash-index - 1] == '\n'
				tag = (text.substring hash-index).replace \# ''
				if tag.length > 0 and tag.match /^\S+$/
					$menu = open!

					# search users
					$.ajax "#{config.web-api-url}/hashtags/search" {
						data: {'name': tag}
						data-type: \json}
					.done (result) ->
						if result? and result.length > 0
							$menu.empty!
							$menu.append $ '<ol class="hashtags">'
							result.for-each (hashtag) ->
								$menu.children \ol .append do
									$ \<li> .append do
										$ '<a class="ui-waves-effect">' .attr {
											'href': "#{config.url}/search/hashtag:#{hashtag}"
											'title': hashtag
											'data-summoner': \#
											'data-value': hashtag}
										.bind \keydown autocomplate-keydown
										.click ->
											complete \# hashtag
											false
										.append do
											$ '<span class="name">' .text "\##{hashtag}"
						else
							close!
					return
				else
					close!
