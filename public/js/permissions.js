const hidden = document.getElementsByClassName("hidden");

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
