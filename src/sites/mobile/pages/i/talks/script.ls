$ = require 'jquery'
require '../../../common/scripts/ui.js'
require '../../../../common/kronos.js'

$ ->
	$ '#search input' .bind \input ->
		$input = $ @
		$result = $ '#search .result'
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
								$ '<a class="ui-waves-effect">' .attr {
									'href': "#{CONFIG.talk-url}/#{user.screen-name}"
									'title': user.comment}
								.append do
									$ '<img class="avatar" alt="avatar">' .attr \src user.avatar-thumbnail-url
								.append do
									$ '<span class="name">' .text user.name
								.append do
									$ '<span class="screen-name">' .text "@#{user.screen-name}"
