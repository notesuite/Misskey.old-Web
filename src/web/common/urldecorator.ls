$ = require 'jquery'

module.exports = ($url) ->
	parser = document.create-element \a
	parser.href = $url.text!

	$url.empty!
	$url.append $ "<span class='protocol'>#{parser.protocol}//</span>"
	$url.append $ "<span class='hostname'>#{parser.hostname}</span>"
	if parser.port != ''
		$url.append $ "<span class='port'>:#{parser.port}</span>"
	if parser.pathname != '/'
		$url.append $ "<span class='pathname'>#{parser.pathname}</span>"
	$url.append $ "<span class='query'>#{parser.search}</span>"
	$url.append $ "<span class='hash'>#{parser.hash}</span>"
	$url
