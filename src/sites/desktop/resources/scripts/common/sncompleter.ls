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

	function complete-sn(sn)
		close!
		source = $input.val!
		before = source.substring 0 caret
		trimed-before = before.substring 0 before.last-index-of \@
		after = source.substring caret
		$input.val trimed-before + \@ + sn + after
		$input.focus!
		$input.select-range caret + sn.length - 1

	function close
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
				e.prevent-default!
				complete-sn ($opening-menu.find "ol > li:nth-child(#{$opening-menu.attr \data-select}) > a" .attr \data-sn)
			| 27 => # Key[ESC]
				e.prevent-default!
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
				close!
				$input.focus!
		$opening-menu.find "ol > li:nth-child(#{$opening-menu.attr \data-select}) > a" .focus!

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

	$dummy-input = $ '<div role="presentation" />'
		..css {
			'position': \absolute
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

	$input.bind \input ->
		caret := get-caret!
		text = $input.val!.substring 0 caret

		close!

		id-at-index = text.last-index-of \@

		if id-at-index != -1
			sn = (text.substring id-at-index).replace \@ ''
			if sn.length > 0 and sn.match /^[a-zA-Z0-9_\-]+$/
				$dummy-text.text text
				$dummy-text.html $dummy-text.text!.replace /(\r\n|\r|\n)/g '<br>'
				$dummy-input[0].scroll-top = $dummy-input[0].scroll-height
				$dummy-input.css {
					'width': $input.width! + 'px'
					'height': $input.height! + 'px'
				}

				input-position = $input.position!
				caret-position = $dummy-text-positioner.position!

				$menu = $ '<div class="ui-autocomplete" data-select="null" />'
				$menu.css {
					'position': \absolute
					'top': (input-position.top + caret-position.top) + 'px'
					'left': (input-position.left + caret-position.left) + 'px'
				}
				$opening-menu := $menu

				$input.parent!.append $menu

				$input.bind \keydown autocomplate-keydown

				# search users
				$.ajax "#{config.web-api-url}/users/search" {
					type: \get
					data: {'screen-name': sn}
					data-type: \json
					xhr-fields: {+with-credentials}}
				.done (result) ->
					if result? and result.length > 0
						$menu.append $ '<ol class="users">'
						result.for-each (user) ->
							$menu.children \ol .append do
								$ \<li> .append do
									$ '<a class="ui-waves-effect">' .attr {
										'href': "#{config.url}/#{user.screen-name}"
										'title': user.comment
										'data-sn': user.screen-name}
									.bind \keydown autocomplate-keydown
									.click ->
										complete-sn user.screen-name
										false
									.append do
										$ '<img class="icon" alt="icon">' .attr \src user.icon-url
									.append do
										$ '<span class="name">' .text user.name
									.append do
										$ '<span class="screen-name">' .text "@#{user.screen-name}"
