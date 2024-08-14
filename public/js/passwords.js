const add_pass = document.getElementById("add_pass");
const hidden = document.getElementsByClassName("hidden");

add_pass.style.display = "none";

for (var i = 0; i < hidden.length; i++) {
	hidden[i].style.visibility = "hidden";
}

function unhide_element(id) {
	if (document.getElementById(id).style.visibility == "hidden") {
		document.getElementById(id).style.visibility = "visible";
	} else {
		document.getElementById(id).style.visibility = "hidden";
	}
}

function show_form(id) {
	if (document.getElementById(id).style.display == "none") {
		document.getElementById(id).style.display = "block";
	} else {
		document.getElementById(id).style.display = "none";
	}
}
