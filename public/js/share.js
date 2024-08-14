new ClipboardJS(".btn");


function copy(id, type) {
	const e = document.querySelector(`#${id}`);
	e.textContent = 'copied!';

	setTimeout(() => {
		e.textContent = type;
	}, 1500)
}
