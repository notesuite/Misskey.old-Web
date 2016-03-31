/**
 * Tab
 * (c) syuilo 2015-2016
 */

var $ = require('jquery');

module.exports = function($tabList, $tabPages, onChanged) {
	function select(tabName, riseChangeEvent) {
		riseChangeEvent = riseChangeEvent === undefined ? true : riseChangeEvent;

		$tabList.children().removeClass('active').addClass('unactive');
		$tabList.children('[data-ref="' + tabName + '"]').removeClass('unactive').addClass('active');

		$tabPages.children().each(function() {
			$(this).css('display', 'none');
		});

		$tabPages.children('[data-name="' + tabName + '"]').css('display', 'block');

		if (onChanged !== undefined && riseChangeEvent) {
			onChanged(tabName);
		}
	}

	$tabList.children().each(function() {
		var $tabListItem = $(this);
		$tabListItem.addClass('unactive');

		$tabListItem.click(function() {
			select($(this).attr('data-ref'));
			return false;
		});
	});

	$tabPages.children().each(function() {
		$(this).css('display', 'none');
	});

	select($tabList.children(':first-child').attr('data-ref'), false);

	return {
		select: select
	};
};
