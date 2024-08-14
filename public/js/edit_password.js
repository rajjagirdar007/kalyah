const p = document.getElementById("cred_pass");
const pb = document.getElementById("p_btn");
const id = document.getElementById("id").value;
const m = document.querySelector("#m");

async function postData(url = '', data = {}) {
	const response = await fetch(url, {
		method: 'post', 
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})

	return response.json();
}

function updateField(e, field) {
	var obj = {
		id: id,
		field: field.id,
		content: field.value
	}

	postData("https://kalyah.com/passwords/edit", obj)
	.then((data) => {
		if (data.status) {
			m.textContent = 'updated!';
			setTimeout(() => {
			  m.textContent = '';
			}, "1500")
		} else {
			m.textContent = 'not able update right now :(';
			setTimeout(() => {
			  m.textContent = '';
			}, "1500")
		}
	})
}

p_btn.addEventListener("click", (e) => {
	e.preventDefault();

	if (p.type == "password") {
		p.type = "text";
		p_btn.textContent = "hide";
	} else if (p.type == "text") {
		p.type = "password";
		p_btn.textContent = "un hide";
	}
})
