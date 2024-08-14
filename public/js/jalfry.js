const frame = document.getElementById("jf");

async function postToken(url = '', data = {}) {
	const response = await fetch(url, {
		method: 'POST',
		redirect: 'follow',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': JSON.stringify(data)
		},
		body: JSON.stringify({ success: ':)' })
	})

	return response.json();
}

window.addEventListener("load", (e) => {
	e.preventDefault();
	
//	console.log('sending URL...');
	frame.contentWindow.postMessage(window.location.href, 'https://jalfry.com/auth');
})

window.addEventListener("message", (e) => {
	e.preventDefault();
	
	if (e.origin == "https://jalfry.com") {
		var data = JSON.stringify(e.data);
		var get_inside_data = data.split("token")[1];
		var token = get_inside_data.split('"')[2];
		
		postToken('https://kalyah.com/login/authorize', { token })
		.then((data) => {
			if (data.url) {
				console.log(data);
				window.location = 'https://kalyah.com' + data.url;
			}
		})
	}

//	window.top.location.href = e.data;
})
