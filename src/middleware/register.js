const path = require("path");
const argon2 = require("argon2");

const db = require("/var/www/kalyah.com/src/db.js");
const datetime = require("/var/www/kalyah.com/src/date.js");

module.exports.register_to_db = async (req, res, next) => {
	const username = req.body.username;
	const password = req.body.password;
	const role = req.body.role;

	const encrypt_pass = await argon2.hash(password);

	db.query(`INSERT INTO users(username, password, role, date_created) VALUES ('${username}', '${encrypt_pass}', '${role}', '${datetime()}')`, (error, results, fields) => {
		if (error) {
			console.log(error);
			res.render("/var/www/kalyah.com/templates/views/register.hbs", {
				message: "there's an issue with registration; try again later!"
			})
		} else {
			console.log(username, "registered successfully!");
		}

		if (role == "member") {
			db.query(`INSERT INTO permissions_by_member(member) VALUES ('${username}')`, (error, results, fields) => {
				
				if (error) {
					console.log(error);
					res.render("/var/www/kalyah.com/templates/views/register.hbs", {
						message: "there's an issue with registration; try again later!"
					})
				} else {
					console.log(username, "registered successfully!");
					next();
				}
			})
		 } else {
			next();
		 }
	})
}
