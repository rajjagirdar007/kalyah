const path = require('path');
const express = require('express');
const mysql = require('mysql');

const router = express.Router();

const db = require(path.join(__dirname, "../db.js")); 
const { encrypt, decrypt } = require(path.join(__dirname, "../crypto.js"));

router.get('/:id', (req, res) => {
	let id = req.params.id;
	let q = `SELECT * FROM passwords WHERE password_id = ${id}`;
	db.query(q, (err, rows, fields) => {
		if (err) throw err;

		if (rows.length > 0) {
			const encrypt_list = rows[0].cred_pass.split(";");
			const encrypted = {
				iv: encrypt_list[0],
				content: encrypt_list[1]
			}
			
			res.render("share_password.hbs", {
				id: rows[0].password_id,
				creator: rows[0].username,
				link: rows[0].original_link,
				website: rows[0].company_website,
				username: rows[0].cred_user,
				password: decrypt(encrypted),
				date: rows[0].date_added,
				notes: rows[0].additional_notes
			})
		} else {
			res.redirect('/');
		}
	})
})

module.exports = router;
