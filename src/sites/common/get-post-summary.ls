module.exports = analyze

function analyze(locale, post)
	switch post.type
	| \status, \reply =>
		text = if post.text? then post.text else ''
		if post.files? and post.files.length > 0
			if text != ''
				text += ' '
			text += switch locale
				| \ja => "(#{post.files.length}個のファイル)"
				| _ =>
					if post.files.length > 1
						"(#{post.files.length} files)"
					else
						"(#{post.files.length} file)"
		return text
	| \repost => "RP #{analyze locale, post.post}"
