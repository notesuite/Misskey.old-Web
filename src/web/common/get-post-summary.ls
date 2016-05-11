module.exports = analyze

function analyze(locale, post)
	switch post.type
		| \status, \reply =>
			text = if post.text? then post.text else ''
			if post.files? && post.files.length > 0
				if text !== '' then text += ' '
				switch locale
					| \ja =>
						text += "(#{post.files.length}個のファイル)"
					| _ =>
						if post.files.length > 1
							text += "(#{post.files.length} files)"
						else
							text += "(#{post.files.length} file)"
			return text
		| \repost =>
			return "RP #{analyze(locale, post.post)}"
