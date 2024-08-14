const path = require('path');
const express = require('express');
const mysql = require('mysql');

const router = express.Router();

const login = require(path.join(__dirname, "../middleware/login.js"));
const db = require(path.join(__dirname, "../db.js")); 
const { encrypt, decrypt } = require(path.join(__dirname, "../crypto.js"));
const mp = require(path.join(__dirname, "../middleware/manage_pass.js"));

router.use(login.login_check);

router.get('/', (req, res) => {
	const info = [];
	let q = `SELECT * FROM passwords WHERE username = '${req.session.username}'`;
	db.query(q, (err, rows, fields) => {
		if (err) throw err;
		
		for (var i = 0; i < rows.length; i++) {
			const encrypt_list = rows[i].cred_pass.split(";");
			const encrypted = {
				iv: encrypt_list[0],
				content: encrypt_list[1]
			}

			let obj = {
				id: rows[i].password_id,
				website: rows[i].company_website,
				edit: `/passwords/edit/${rows[i].password_id}`,
				username: rows[i].cred_user,
				password: decrypt(encrypted),
				share: `https://kalyah.com/share/${rows[i].password_id}`,
				notes: rows[i].additional_notes,
				link: rows[i].original_link
			}

			info.push(obj);
		}

		res.render("password.hbs", {
			username: req.session.username,
			password: info
		})
	})
})

router.get('/create', (req, res) => {
	res.render("add_password.hbs", {
		username: req.session.username
	})
})

router.get('/:id', (req, res) => {
	let id = req.params.id;
	let q = `SELECT * FROM passwords WHERE password_id = ${id}`;
	db.query(q, (err, rows, fields) => {
		if (err) throw err;
		
		const encrypt_list = rows[0].cred_pass.split(";");
		const encrypted = {
			iv: encrypt_list[0],
			content: encrypt_list[1]
		}
		
		res.render("edit_password.hbs", {
			username: req.session.username,
			id: rows[0].password_id,
			creator: rows[0].username,
			link: rows[0].original_link,
			website: rows[0].company_website,
			username: rows[0].cred_user,
			password: decrypt(encrypted),
			date: rows[0].date_added,
			notes: rows[0].additional_notes
		})
	})
})

router.get("/delete/:id", (req, res) => {
	let id = req.params.id;
	let q = `DELETE FROM passwords WHERE password_id = ${id}`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		res.redirect("/passwords");
	})
})

router.post('/edit', (req, res) => {
	let id = req.body.id;
	let field = req.body.field;
	let cont = req.body.content;

	if (field == 'cred_pass') {
		cont = encrypt(cont);
	}

	let q = `UPDATE passwords SET ${field} = '${cont}' WHERE password_id = ${id}`;
	db.query(q, (err, results, fields) => {
		if (err) {
			console.log(err);
			res.send({ status: false, message: 'not able to update at this time...' });
		} else {
			res.send({ status: true, message: 'success :)' });
		}
	})
})

router.post('/create', mp.add, (req, res) => {
	res.redirect("/passwords");
})

module.exports = router;
