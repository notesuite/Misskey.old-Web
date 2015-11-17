/**
 * Tab
 * (c) syuilo 2015
 */

var $ = require('jquery');

module.exports = function($tabList, onChanged) {
	var ids = [];
	var $tabContents = [];
	
	function select(id, riseChangeEvent) {
		riseChangeEvent = riseChangeEvent === undefined ? true : riseChangeEvent;

		var num = ids.indexOf(id);
		$tabList.find('li').removeClass('active').addClass('unactive');
		$tabList.find('li:eq(' + num + ')').removeClass('unactive').addClass('active');

		$.each($tabContents, function() {
			$(this).css('display', 'none');
		});

		$tabContents[num].css('display', 'block');
		
		if (onChanged !== undefined && riseChangeEvent) {
			onChanged(id);
		}
	}
	
	$tabList.find('li').each(function(i, elem) {
		var $tabListItem = $(elem);
		var id = $tabListItem.attr('data-ref');
		ids.push(id);
		$tabContents.push($('#' + id));
		$tabListItem.addClass('unactive');
		
		$tabListItem.click(function() {
			select($(this).attr('data-ref'));
			return false;
		});
	});

	$.each($tabContents, function() {
		$(this).css('display', 'none');
	});

	$tabList.find('li:eq(0)').removeClass('unactive').addClass('active');
	$tabContents[0].css('display', 'block');
	
	return {
		select: select
	};
};
