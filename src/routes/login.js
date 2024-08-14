const express = require('express');

const router = express.Router();

router.post('/', (req, res) => {
	//username and permission information from jalfry
	let u = req.body.username;
	let p = req.body.permission;

	//store user information in session
	req.session.username = u;
	req.session.role = p;
	req.session.loggedin = true;

	//redirect user to the application
	res.send({ url: `https://kalyah.com/panel` });
})

module.exports = router;
