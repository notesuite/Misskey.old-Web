require '../base.js'
$ = require 'jquery'
UsersList = require '../../../common/widgets/users-list/script.js'

$ ->
	users-list = new UsersList $ \#following
