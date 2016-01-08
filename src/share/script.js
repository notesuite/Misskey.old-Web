var buttonStyle = "\
button.misskey-share {\
	-webkit-appearance: none;\
	-moz-appearance: none;\
	appearance: none;\
	display: block;\
	box-sizing: border-box;\
	margin: 0;\
	padding: 0;\
	font-size: 0.8rem;\
	font-weight: normal;\
	background: #ec6b43;\
	outline: none;\
	border: none;\
	border-radius: 2px;\
	box-shadow: none;\
}\
\
button.misskey-share:hover {\
	background: #f18f71;\
}\
\
button.misskey-share:active {\
	background: #e54817;\
}\
\
button.misskey-share > .a {\
	display: inline-block;\
	padding: 8px 12px;\
	color: #fff;\
	text-decoration: none;\
}\
\
button.misskey-share > .count {\
	display: inline-block;\
	padding: 8px 10px;\
	color: #fff;\
	text-decoration: none;\
	background: rgba(255, 255, 255, 0.15);\
}\
\
button.misskey-share > .count:hover {\
	text-decoration: underline;\
}\
\
";

window.addEventListener('onload', function() {
	var style = document.createElement('style');
	style.appendChild(document.createTextNode(buttonStyle));
	document.getElementsByTagName('head')[0].appendChild(style);

	var shareFormUrl = 'https://share.misskey.xyz/?title=' + document.title + '&url=' + location.href;

	[].forEach.call(document.getElementsByClassName('misskey-share'), function(button) {
		var a = document.createElement('a');
		a.textContent = 'Misskeyでシェア';
		a.setAttribute('class', 'a');
		a.setAttribute('href', shareFormUrl);
		a.setAttribute('title', 'Misskeyでみんなと共有');
		a.setAttribute('target', 'misskey');
		a.onclick = function() {
			window.open(shareFormUrl, 'Misskey', 'width=500, height=400, scrollbars=yes');
			return false;
		};
		button.appendChild(a);

		var count = document.createElement('a');
		count.textContent = '-';
		count.setAttribute('class', 'count');
		count.setAttribute('href', 'https://search.misskey.xyz/?q=' + location.href);
		count.setAttribute('target', '_blank');
		button.appendChild(count);

		var ajax = null;

		if (XMLHttpRequest) {
			ajax = new XMLHttpRequest();
		} else {
			ajax = new ActiveXObject('MSXML2.XMLHTTP.6.0');
			if (!ajax) {
				ajax = new ActiveXObject('MSXML2.XMLHTTP.3.0');
				if (!ajax) {
					ajax = new ActiveXObject('MSXML2.XMLHTTP');
					if (!ajax) {
						return;
					}
				}
			}
		}

		ajax.open('POST','https://api.misskey.xyz/share/count?url=' + location.href, true);
		ajax.onreadystatechange = function Receive() {
			if (ajax.readyState == 4 && ajax.status == 200) {
				count.textContent = ajax.responseText;
				return;
			} else if (ajax.status != 200) {
				return;
			}
		}
		ajax.send(null);
	});
});
