/**
 * Tab
 * (c) syuilo 2015
 */

module.exports = function($tabList) {
	var $tabContents = [];

	$tabList.find('li').each(function(i, elem) {
		var $tabListItem = $(elem);
		var id = '#' + $tabListItem.attr('data-ref');
		$tabContents.push($(id));
		$tabListItem.addClass('unactive');

		$tabListItem.click(function() {
			var num = $tabList.find('li').index(this);
			$tabList.find('li').removeClass('active').addClass('unactive');
			$(this).removeClass('unactive').addClass('active');

			$.each($tabContents, function() {
				$(this).css('display', 'none');
			});

			$tabContents[num].css('display', 'block');

			return false;
		});
	});

	$.each($tabContents, function() {
		$(this).css('display', 'none');
	});

	$tabList.find('li:eq(0)').removeClass('unactive').addClass('active');
	$tabContents[0].css('display', 'block');
}