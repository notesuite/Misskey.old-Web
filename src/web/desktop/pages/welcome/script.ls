$ = require 'jquery/dist/jquery'

$ ->
	$ \h1 .animate {
		opacity: 1
	} 1000ms
	$ \h1 .css \top \0px
	set-timeout ->
		$ \#slides .animate {
			opacity: 1
		} 1000ms
		$ \#slides .css \top \0px
	, 500ms
