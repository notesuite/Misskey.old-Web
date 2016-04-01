$ = require 'jquery/dist/jquery'
require '../../../common/scripts/ui.ls'
upload-file = require '../../../../common/upload-file.js'

$ ->
	$input = $ \#file

	$files = $ \#files

	$input.change ->
		files = $input[0].files
		for i from 0 to files.length - 1
			file = files.item i
			upload file
		$input.val ''

	function upload file
		$info = $ "<li>
			<p class='title'>
				<span class='name'>#{file.name}</span>
				<span class='status'>#{LOCALE.sites.mobile.pages._i._upload.uploading}</span>
			</p>
			<progress></progress>
		</li>"
		$status = $info.find \.status
		$progress = $info.find \progress
		$files.prepend $info

		upload-file do
			file
			if FOLDER? then FOLDER.id else null
			$progress
			null
			(file-obj) ->
				$status.text LOCALE.sites.mobile.pages._i._upload.success
			(err) ->
				$status.text LOCALE.sites.mobile.pages._i._upload.failed
			->
				$progress.remove!
