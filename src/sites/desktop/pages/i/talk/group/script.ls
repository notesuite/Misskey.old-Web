$ = require 'jquery'
show-modal-dialog = require '../../../../common/scripts/modal-dialog.js'
require '../main.js'

$ ->
	$ 'main > header > .body > .nav > button' .click ->
		$dropdown = $ 'main > header > .body > .nav'

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

	$ 'main > header > .body > .nav .invite' .click ->
		$modal-ok = $ '<button>やっぱりやめます</button>'
		$search = $ '
			<div id="invite-search">
				<input type="text" placeholder="ユーザーを検索">
				<div class="result">
				</div>
			</div>'
		dialog-close = show-modal-dialog do
			$ '<p><i class="fa fa-search"></i>ユーザーを検索してグループに招待</p>'
			$search
			[$modal-ok]
			true
			->
				$search.find 'input' .focus!
		$modal-ok.click -> dialog-close!

		$search.find 'input' .bind \input ->
			$input = $ @
			$result = $search.find '.result'
			if $input .val! == ''
				$result.empty!
			else
				$.ajax "#{CONFIG.web-api-url}/users/search" {
					data:
						'query': $input .val!}
				.done (result) ->
					$result.empty!
					if (result.length > 0) && ($input .val! != '')
						$result.append $ '<ol class="users">'
						result.for-each (user) ->
							$result.find \ol .append do
								$ \<li> .append do
									$ '<div>' .attr {
										'title': user.comment}
									.append do
										$ '<img class="avatar" alt="avatar">' .attr \src user.avatar-thumbnail-url
									.append do
										$ '<span class="name">' .text user.name
									.append do
										$ '<span class="screen-name">' .text "@#{user.screen-name}"
									.append do
										$ '<button class="invite">'
										.text "招待"
										.click ->
											dialog-close!
											send-invitetion user

function send-invitetion(user)
	$modal-ok = $ '<button>招待する</button>'
	$modal-cancel = $ '<button>キャンセル</button>'
	$textarea = $ '<textarea placeholder="招待状のメッセージを記入できます(オプション)"></textarea>'
		.val "こんにちは、#{user.name}さん。#{GROUP.name}に参加しませんか？"
	dialog-close = show-modal-dialog do
		$ '<p>招待状のメッセージを記入できます</p>'
		$textarea
		[$modal-cancel, $modal-ok]
		false
		->
			$textarea.focus!
		'invite-form'
	$modal-cancel.click ->
		dialog-close!
		return
	$modal-ok.click ->
		dialog-close!

		$.ajax "#{CONFIG.web-api-url}/talks/group/members/invite" {
			data:
				'group-id': GROUP.id
				'user-id': user.id
				'text': $textarea.val!}
		.done ->
			$modal-ok = $ '<button>Okay</button>'
			dialog-close2 = show-modal-dialog do
				$ '<p><i class="fa fa-info-circle"></i>招待しました</p>'
				$ "<p />" .text "#{user.name}さんを招待しました。"
				[$modal-ok]
			$modal-ok.click ->
				dialog-close2!
		.fail (err) ->
			$modal-ok = $ '<button>おｋ</button>'
			dialog-close2 = show-modal-dialog do
				$ '<p><i class="fa fa-exclamation-triangle"></i>招待できませんでした</p>'
				$ "<p />" .text "エラー: #{err.response-text}"
				[$modal-ok]
			$modal-ok.click ->
				dialog-close2!
