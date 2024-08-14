new ClipboardJS('.btn');


function copy(id, type) {
	let e = document.querySelector(`#${id}`);
	e.textContent = 'copied!';

	setTimeout(() => {
		e.textContent = type;
	}, 1500);
}
