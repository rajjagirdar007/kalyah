const i = document.getElementById("i");

new ClipboardJS('#username');
new ClipboardJS('#password');
new ClipboardJS('#share');

function clickHandler(e, element) {
	e.preventDefault();

	i.placeholder = 'copied!';
}

function resetText(e, element, text) {
	e.preventDefault();

	i.placeholder = 'Search here...';
}
