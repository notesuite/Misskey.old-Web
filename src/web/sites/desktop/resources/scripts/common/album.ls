$ ->
	current-location = null
	$album = $ \#misskey-album
	$album-files = $album.find '> .files'

	load-files!

	function load-files
		$.ajax "#{config.api-url}/web/album/files" {
			type: \get
			data: {}
			-processData
			-contentType
			data-type: \text
			xhr-fields: {+with-credentials}}
		.done (html) ->
			$files = $ html
			$album-files.empty!
			$album-files.append $files
		.fail ->
			window.display-message '読み込みに失敗しました。再度お試しください。'
