module.exports.login_check = (req, res, next) => {
	if (req.session.loggedin) {
		next();
	} else {
		res.redirect('/')
	}
}
