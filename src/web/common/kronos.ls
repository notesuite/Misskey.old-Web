$ = require 'jquery'

function update-relative-times
	now = new Date!
	$ "time[data-display-type='relative']" .each ->
		date = new Date($ @ .attr \datetime)
		ago = ~~((now - date) / 1000)
		time-text = switch
			| ago >= 31536000s => LOCALE.common.times.years_ago.replace '{n}' ~~(ago / 31536000s)
			| ago >= 2592000s  => LOCALE.common.times.months_ago.replace '{n}' ~~(ago / 2592000s)
			| ago >= 604800s   => LOCALE.common.times.weeks_ago.replace '{n}' ~~(ago / 604800s)
			| ago >= 86400s    => LOCALE.common.times.days_ago.replace '{n}' ~~(ago / 86400s)
			| ago >= 3600s     => LOCALE.common.times.hours_ago.replace '{n}' ~~(ago / 3600s)
			| ago >= 60s       => LOCALE.common.times.minutes_ago.replace '{n}' ~~(ago / 60s)
			| ago >= 10s       => LOCALE.common.times.seconds_ago.replace '{n}' ~~(ago % 60s)
			| ago <  10s       => LOCALE.common.times.just_now
			| _ => ''
		$ @ .text time-text

$ ->
	update-relative-times!
	set-interval update-relative-times, 1000ms
