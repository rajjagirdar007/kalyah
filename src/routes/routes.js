const path = require("path");
const express = require("express");

const router = express.Router();

const db = require(path.join(__dirname, "../db.js")); 
const { encrypt, decrypt } = require(path.join(__dirname, "../crypto.js"));

const login = require(path.join(__dirname, "../middleware/login.js"));
const manage_pass = require(path.join(__dirname, "../middleware/manage_pass.js"));

router.get("/share/:id", (req, res) => {
	let id = req.params.id;
	let q = `SELECT * FROM passwords WHERE password_id = ${id}`;
	db.query(q, (err, rows, fields) => {
		if (err) throw err;

		const encrypt_list = rows[0].cred_pass.split(";");
		const encrypted = {
			iv: encrypt_list[0],
			content: encrypt_list[1]
		}
		
		res.render("share_password.hbs", {
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

router.use(login.login_check);

router.get("/manage", (req, res) => {
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
				share: `https://kalyah.com/passwords/share/${rows[i].password_id}`,
				notes: rows[i].additional_notes,
				link: rows[i].original_link
			}

			info.push(obj);
		}

		res.render("lists.hbs", {
			username: req.session.username,
			row: info
		})
	})
})

router.get("/add", (req, res) => {
	res.render("add_password.hbs", {
		username: req.session.username
	})
})

router.post("/add", manage_pass.add, (req, res) => {
	res.redirect("/passwords/manage");
})

router.get("/edit/:id", (req, res) => {
	var id = req.params.id;
	var content = [];

	db.query(`SELECT * FROM passwords WHERE password_id = ${id}`, (err, rows, fields) => {
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

router.post("/edit", (req, res) => {
	var id = req.body.id;
	var field = req.body.field;
	var cont = req.body.content;

	if (field == 'cred_pass') {
		var cont = encrypt(cont);
	}

	var q = `UPDATE passwords SET ${field} = '${cont}' WHERE password_id = ${id}`;
	db.query(q, (err, results, fields) => {
		if (err) {
			console.log(err);
			res.send({ status: false, message: 'not able to update at this time...' });
		} else {
			res.send({ status: true, message: 'success :)' });
		}
	})
})

router.get("/delete/:id", (req, res) => {
	var q = `DELETE FROM passwords WHERE password_id = ${req.params.id}`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		res.redirect("/passwords/manage");
	})
})

/*
app.get("/password/*", session_check.session_check, login.check_login, login.check_admin, (req, res) => {
	const id = req.originalUrl.split("/password/")[1];
	const content = [];

	db.query(`SELECT * FROM passwords WHERE password_id = ${id}`, (err, rows, fields) => {
		if (err) throw err;

		for (var i = 0; i < rows.length; i++) {
			const encrypt_list = rows[i].cred_pass.split(";");
			const encrypted = {
				iv: encrypt_list[0],
				content: encrypt_list[1]
			}

			let obj = {
				password_id: rows[i].password_id,
				creator: rows[i].username,
				original_link: rows[i].original_link,
				company_website: rows[i].company_website,
				cred_user: rows[i].cred_user,
				cred_pass: decrypt(encrypted),
				date_added: rows[i].date_added,
				additional_notes: rows[i].additional_notes,
				additional_img_paths: rows[i].additional_img_paths
			}

			content.push(obj);
		}

		res.render("/var/www/kalyah.com/templates/views/ind_passwords.hbs", {
			username: req.session.username,
			row: content
		})
	})
})

app.get("/permissions_module", session_check.session_check, login.check_login, login.check_admin, (req, res) => {
	res.render("/var/www/kalyah.com/templates/views/permissions_page.hbs", {
		username: req.session.username
	})
})

app.get("/permissions_module/entity", session_check.session_check, login.check_login, login.check_admin, (req, res) => {
	const content = [];

	db.query(`SELECT * FROM permissions_by_member`, (err, rows, fields) => {
		if (err) throw err;

		for (var i = 0; i < rows.length; i++) {
			let obj = {
				permissions_id: rows[i].permissions_id,
				member: rows[i].member,
				link: `/app/permissions_module/entity/${rows[i].permissions_id}`
			}

			content.push(obj);
		}

		res.render("/var/www/kalyah.com/templates/views/entity_permissions.hbs", {
			username: req.session.username,
			row: content
		})
	})
})

app.get("/permissions_module/entity/*", session_check.session_check, login.check_login, login.check_admin, (req, res) => {
	const id = req.originalUrl.split("/entity/")[1];

	db.query(`SELECT * FROM permissions_by_member where permissions_id = ${id}`, (err, rows, fields) => {
		if (err) throw err;

		if (rows[0].access_to === null) {
			const access = [];
			const entity = rows[0].member;

			db.query(`SELECT original_link FROM permissions_by_resource`, (err, rows, fields) => {
				if (err) throw err;

				const rows_adjusted = [];
				for (var i = 0; i < rows.length; i++) {
					rows_adjusted.push(rows[i].original_link);
				}

				res.render("/var/www/kalyah.com/templates/views/entity_control.hbs", {
					username: req.session.username,
					entity: entity,
					accessible: access,
					restricted: rows_adjusted
				})
			})
		} else {
			const access = rows[0].access_to.split(", ");
			const entity = rows[0].member;

			db.query(`SELECT original_link FROM permissions_by_resource`, (err, rows, fields) => {
				if (err) throw err;
				
				const rows_adjusted = [];
				for (var i = 0; i < rows.length; i++) {
					rows_adjusted.push(rows[i].original_link);
				}

				for (var i = 0; i < access.length; i++) {
					if (rows_adjusted.includes(access[i])) {
						const value = access[i];
						
						for (var j = 0; j < rows_adjusted.length; j++) {
							if (rows_adjusted[j] === value) {
								rows_adjusted.splice(j, 1);
							}
						}
					}
				}

				console.log(rows_adjusted);
				res.render("/var/www/kalyah.com/templates/views/entity_control.hbs", {
					username: req.session.username, 
					entity: entity,
					accessible: access,
					restricted: rows_adjusted
				});
			})
		}
	})
})

app.post("/allow_entity", (req, res) => {
	const entity = req.body.member;
	const resource = req.body.resource;

	db.query(`SELECT * FROM permissions_by_resource WHERE original_link = '${resource}'`, (err, rows, fields) => {
		if (err) throw err;

		if (rows[0].access_to === null) {
			db.query(`UPDATE permissions_by_resource SET access_to = '${entity}' WHERE original_link = '${resource}'`, (err, results, fields) => {
				if (err) throw err;

				console.log(results);
			})
		} else {
			const updated_access = rows[0].access_to + `, ${entity}`;

			db.query(`UPDATE permissions_by_resource SET access_to = '${updated_access}' WHERE original_link = '${resource}'`, (err, results, fields) => {
				if (err) throw err;

				console.log(results);
			})
		}
	})

	db.query(`SELECT * FROM permissions_by_member WHERE member = '${entity}'`, (err, rows, fields) => {
		if (err) throw err;

		if (rows[0].access_to === null) {
			db.query(`UPDATE permissions_by_member SET access_to = '${resource}' WHERE member = '${entity}'`, (err, results, fields) => {
				if (err) throw err;

				console.log(results);

				res.redirect(req.headers.referer);
			}) } else {
			const updated_access = rows[0].access_to + `, ${resource}`;

			db.query(`UPDATE permissions_by_member SET access_to = '${updated_access}' WHERE member = '${entity}'`, (err, results, fields) => {
				if (err) throw err;

				console.log(results);

				res.redirect(req.headers.referer);
			})
		}
	})
})

app.post("/restrict_entity", (req, res) => {
	const entity = req.body.member;
	const resource = req.body.resource;

	db.query(`SELECT * FROM permissions_by_resource WHERE original_link = '${resource}'`, (err, rows, fields) => {
		if (err) throw err;

		const access = rows[0].access_to.split(", ");

		for (var i = 0; i < access.length; i++) {
			if (access[i] === entity) {
				access.splice(i, 1);
			}
		}

		console.log(access.length);

		if (access.length == 0) {
			db.query(`UPDATE permissions_by_resource SET access_to = NULL WHERE original_link = '${resource}'`, (err, results, fields) => {
				if (err) throw err;

				console.log(results);

				console.log(`${resource} restricted from ${entity}!`);
			})
		} else {
			db.query(`UPDATE permissions_by_resource SET access_to = '${access.join(", ")}' WHERE original_link = '${resource}'`, (err, results, fields) => {
				if (err) throw err;
				
				console.log(results);

				console.log(`${resource} restricted from  ${entity}!`);
			})
		}
	})
	
	db.query(`SELECT * FROM permissions_by_member WHERE member = '${entity}'`, (err, rows, fields) => {
		if (err) throw err;

		const access = rows[0].access_to.split(", ");

		for (var i = 0; i < access.length; i++) {
			if (access[i] === resource) {
				access.splice(i, 1);
			}
		}

		console.log(access.length);

		if (access.length == 0) {
			db.query(`UPDATE permissions_by_member SET access_to = NULL WHERE member = '${entity}'`, (err, results, fields) => {
				if (err) throw err;

				console.log(results);

				console.log(`${entity} lost access to ${resource}!`);
				res.redirect(req.headers.referer);
			})
		} else {
			db.query(`UPDATE permissions_by_member SET access_to = '${access.join(", ")}' WHERE member = '${entity}'`, (err, results, fields) => {
				if (err) throw err;
				
				console.log(results);

				console.log(`${entity} lost access to ${resource}!`);
				res.redirect(req.headers.referer);
			})
		}
	})
})

app.get("/permissions_module/resource", session_check.session_check, login.check_login, login.check_admin, (req, res) => {
	const content = [];

	db.query(`SELECT * FROM permissions_by_resource`, (err, rows, fields) => {
		if (err) throw err;

		for (var i = 0; i < rows.length; i++) {
			let obj = {
				permissions_id: rows[i].permissions_id,
				original_link: rows[i].original_link,
				link: `/app/permissions_module/resource/${rows[i].permissions_id}`
			}

			content.push(obj);
		}

		res.render("/var/www/kalyah.com/templates/views/resource_permissions.hbs", {
			username: req.session.username,
			row: content
		})
	})
})

app.get("/permissions_module/resource/*", session_check.session_check, login.check_login, login.check_admin, (req, res) => {
	const id = req.originalUrl.split("/resource/")[1];

	db.query(`SELECT * FROM permissions_by_resource where permissions_id = ${id}`, (err, rows, fields) => {
		if (err) throw err;

		if (rows[0].access_to === null) {
			const access = [];
			const resource = rows[0].original_link;

			db.query(`SELECT member FROM permissions_by_member`, (err, rows, fields) => {
				if (err) throw err;

				const rows_adjusted = [];
				for (var i = 0; i < rows.length; i++) {
					rows_adjusted.push(rows[i].member);
				}

				res.render("/var/www/kalyah.com/templates/views/resource_control.hbs", {
					username: req.session.username,
					resource: resource,
					accessible: access,
					restricted: rows_adjusted
				})
			})
		} else {
			const access = rows[0].access_to.split(", ");
			const resource = rows[0].original_link;

			db.query(`SELECT member FROM permissions_by_member`, (err, rows, fields) => {
				if (err) throw err;
				
				const rows_adjusted = [];
				for (var i = 0; i < rows.length; i++) {
					rows_adjusted.push(rows[i].member);
				}

				for (var i = 0; i < access.length; i++) {
					if (rows_adjusted.includes(access[i])) {
						const value = access[i];
						
						for (var j = 0; j < rows_adjusted.length; j++) {
							if (rows_adjusted[j] === value) {
								rows_adjusted.splice(j, 1);
							}
						}
					}
				}

				console.log(rows_adjusted);
				res.render("/var/www/kalyah.com/templates/views/resource_control.hbs", {
					username: req.session.username, 
					resource: resource,
					accessible: access,
					restricted: rows_adjusted
				});
			})
		}
	})
})

app.post("/allow_resource", (req, res) => {
	const entity = req.body.member;
	const resource = req.body.resource;

	console.log(resource);

	db.query(`SELECT * FROM permissions_by_resource WHERE original_link = '${resource}'`, (err, rows, fields) => {
		if (err) throw err;

		if (rows[0].access_to === null) {
			db.query(`UPDATE permissions_by_resource SET access_to = '${entity}' WHERE original_link = '${resource}'`, (err, results, fields) => {
				if (err) throw err;

				console.log(results);
			})
		} else {
			const updated_access = rows[0].access_to + `, ${entity}`;

			db.query(`UPDATE permissions_by_resource SET access_to = '${updated_access}' WHERE original_link = '${resource}'`, (err, results, fields) => {
				if (err) throw err;

				console.log(results);
			})
		}
	})

	db.query(`SELECT * FROM permissions_by_member WHERE member = '${entity}'`, (err, rows, fields) => {
		if (err) throw err;

		if (rows[0].access_to === null) {
			db.query(`UPDATE permissions_by_member SET access_to = '${resource}' WHERE member = '${entity}'`, (err, results, fields) => {
				if (err) throw err;

				console.log(results);

				res.redirect(req.headers.referer);
			}) } else {
			const updated_access = rows[0].access_to + `, ${resource}`;

			db.query(`UPDATE permissions_by_member SET access_to = '${updated_access}' WHERE member = '${entity}'`, (err, results, fields) => {
				if (err) throw err;

				console.log(results);

				res.redirect(req.headers.referer);
			})
		}
	})
})

app.post("/restrict_resource", (req, res) => {
	const entity = req.body.member;
	const resource = req.body.resource;

	db.query(`SELECT * FROM permissions_by_resource WHERE original_link = '${resource}'`, (err, rows, fields) => {
		if (err) throw err;

		const access = rows[0].access_to.split(", ");

		for (var i = 0; i < access.length; i++) {
			if (access[i] === entity) {
				access.splice(i, 1);
			}
		}

		console.log(access.length);

		if (access.length == 0) {
			db.query(`UPDATE permissions_by_resource SET access_to = NULL WHERE original_link = '${resource}'`, (err, results, fields) => {
				if (err) throw err;

				console.log(results);

				console.log(`${resource} restricted from ${entity}!`);
			})
		} else {
			db.query(`UPDATE permissions_by_resource SET access_to = '${access.join(", ")}' WHERE original_link = '${resource}'`, (err, results, fields) => {
				if (err) throw err;
				
				console.log(results);

				console.log(`${resource} restricted from  ${entity}!`);
			})
		}
	})
	
	db.query(`SELECT * FROM permissions_by_member WHERE member = '${entity}'`, (err, rows, fields) => {
		if (err) throw err;

		const access = rows[0].access_to.split(", ");

		for (var i = 0; i < access.length; i++) {
			if (access[i] === resource) {
				access.splice(i, 1);
			}
		}

		console.log(access.length);

		if (access.length == 0) {
			db.query(`UPDATE permissions_by_member SET access_to = NULL WHERE member = '${entity}'`, (err, results, fields) => {
				if (err) throw err;

				console.log(results);

				console.log(`${entity} lost access to ${resource}!`);
				res.redirect(req.headers.referer);
			})
		} else {
			db.query(`UPDATE permissions_by_member SET access_to = '${access.join(", ")}' WHERE member = '${entity}'`, (err, results, fields) => {
				if (err) throw err;
				
				console.log(results);

				console.log(`${entity} lost access to ${resource}!`);
				res.redirect(req.headers.referer);
			})
		}
	})
})

app.get("/manage_passwords/permissions_module", session_check.session_check, login.check_login, login.check_admin, (req, res) => {
	const all_content = [];
	const members = [];

	db.query(`SELECT * FROM permissions_by_resource`, (err, rows, fields) => {
		if (err) throw err;

		db.query(`SELECT username FROM users WHERE role = 'member'`, (err, results, fields) => {
			if (err) throw err;

			for (var i = 0; i < results.length; i++) {
				members.push(results[i].username)
			}

			console.log(members);

			for (var j = 0; j < rows.length; j++) {
				let obj = {
					permissions_id: rows[j].permissions_id,
					original_link: rows[j].original_link,
					access_to: rows[j].access_to,
					edit_link: `/app/manage_passwords/permissions/${rows[j].permissions_id}`
				}

				all_content.push(obj);
			}

			res.render("/var/www/kalyah.com/templates/views/permissions.hbs", {
				username: req.session.username,
				row: all_content,
				member: members
			});
		})
	})
})

app.get("/manage_passwords/permissions_by_member", session_check.session_check, login.check_login, login.check_admin, (req, res) => {
	const content = [];

	db.query(`SELECT * FROM permissions_by_member`, (err, rows, fields) => {
		if (err) throw err;

		for (var i = 0; i < rows.length; i++) {
			let obj = {
				permissions_id: rows[i].permissions_id,
				member: rows[i].member,
				access_to: rows[i].access_to,
				edit_link: `/app/manage_passwords/permissions_member/${rows[i].permissions_id}`
			}

			content.push(obj);
		}

		res.render("/var/www/kalyah.com/templates/views/permissions_mem.hbs", {
			username: req.session.username,
			row: content
		})
	})
})

app.get("/manage_passwords/permissions/*", session_check.session_check, login.check_login, login.check_admin, (req, res) => {
	const id = req.originalUrl.split("/permissions/")[1];
	const members = [];

	db.query(`SELECT * FROM permissions_by_resource WHERE permissions_id = ${id}`, (err, rows, fields) => {
		if (err) throw err;

		db.query(`SELECT username FROM users WHERE role = 'member'`, (err, results, fields) => {
			if (err) throw err;

			for (var i = 0; i < results.length; i++) {
				members.push(results[i].username);
			}

			console.log(members);

			res.render("/var/www/kalyah.com/templates/views/ind_permissions.hbs", {
				username: req.session.username,
				row: rows,
				member: members
			});
		})
	})
})	

app.get("/manage_passwords/permissions_member/*", session_check.session_check, login.check_login, login.check_admin, (req, res) => {
	const id = req.originalUrl.split("/permissions_member/")[1];
	const content = [];

	db.query(`SELECT * FROM permissions_by_member WHERE permissions_id = ${id}`, (err, rows, fields) => {
		if (err) throw err;
		
		db.query(`SELECT original_link FROM permissions_by_resource`, (err, results, fields) => {
			if (err) throw err;

			for (var i = 0; i < results.length; i++) {
				content.push(results[i].original_link);
			}

			res.render("/var/www/kalyah.com/templates/views/ind_mem_permissions.hbs", {
				username: req.session.username,
				row: rows,
				resource: content
			})
		})
	})
})

app.get("/view_passwords", session_check.session_check, login.check_login, login.check_member, (req, res) => {
	const content = [];
	const info = [];

	db.query(`SELECT * FROM permissions_by_resource`, (err, rows, fields) => {
		if (err) throw err;

		for (var i = 0; i < rows.length; i++) {
			if (rows[i].access_to === null) {
				i += 1;
			} else if (rows[i].access_to.includes(req.session.username)) {
				content.push(rows[i].original_link);
			}
		}

		db.query(`SELECT * FROM passwords`, (err, rows, fields) => {
			if (err) throw err;

			for (var i = 0; i < rows.length; i++) {
				if (content.indexOf(rows[i].original_link) > -1) {
					let obj = {
						original_link: rows[i].original_link,
						link: `/app/view_passwords/${rows[i].password_id}`
					}

					info.push(obj);
				}
			}

			console.log(info);
			
			res.render("/var/www/kalyah.com/templates/views/view_pass.hbs", {
				user: req.session.username,
				row: info
			});
		})
	})
})

app.get("/view_passwords/*", session_check.session_check, login.check_login, login.check_member, (req, res) => {
	const id = req.originalUrl.split("/view_passwords/")[1];
	const content = [];

	db.query(`SELECT * FROM passwords WHERE password_id = ${id}`, (err, rows, fields) => {
		if (err) throw err;

		for (var i = 0; i < rows.length; i++) {
			const encrypt_list = rows[i].cred_pass.split(";");
			const encrypted = {
				iv: encrypt_list[0],
				content: encrypt_list[1]
			}

			let obj = {
				password_id: rows[i].password_id,
				original_link: rows[i].original_link,
				cred_user: rows[i].cred_user,
				cred_pass: decrypt(encrypted),
				date_added: rows[i].date_added,
				additional_notes: rows[i].additional_notes,
				additional_img_paths: rows[i].additional_img_paths
			}

			content.push(obj);
		}

		res.render("/var/www/kalyah.com/templates/views/ind_passwords.hbs", {
			username: req.session.username,
			row: content
		})
	})
})

app.post("/add_pass", manage_pass.add_pass, (req, res) => {
	console.log(`${req.session.username} added a password!`);
	res.redirect("/app/manage_passwords");
})

app.post("/delete_pass", manage_pass.delete_pass, (req, res) => {
	console.log(`${req.session.username} deleted a password!`);
	res.redirect("/app/manage_passwords");
})

app.post("/add_member", (req, res) => {
	const permissions_id = req.body.id;
	const link = req.body.link;
	const member = req.body.member;

	db.query(`SELECT access_to FROM permissions_by_resource WHERE permissions_id = ${permissions_id}`, (err, results, fields) => {
		if (err) throw err;

		console.log(results);

		if (results[0].access_to === null) {
			db.query(`UPDATE permissions_by_resource SET access_to = '${member}' WHERE permissions_id = ${permissions_id}`, (err, results, fields) => {
				if (err) throw err;

				console.log(results);
			})
		} else {
			db.query(`UPDATE permissions_by_resource SET access_to = CONCAT(access_to, ', ${member}') WHERE permissions_id = ${permissions_id}`, (err, results, fields) => {
				if (err) throw err;

				console.log(results);
			})
		}
	})

	db.query(`SELECT access_to FROM permissions_by_member WHERE member = '${member}'`, (err, results, fields) => {
		if (err) throw err;

		console.log(results);

		if (results[0].access_to === null) {
			db.query(`UPDATE permissions_by_member SET access_to = '${link}' WHERE member = '${member}'`, (err, results, fields) => {
				if (err) throw err;

				console.log(results);

				res.redirect(`/app/manage_passwords/permissions/${permissions_id}`);
			})
		} else {
			db.query(`UPDATE permissions_by_member SET access_to = CONCAT(access_to, ', ${link}') WHERE member = '${member}'`, (err, results, fields) => {
				if (err) throw err;
				
				console.log(results);

				res.redirect(`/app/manage_passwords/permissions/${permissions_id}`);
			})
		}
	})
})

app.post("/add_resource", (req, res) => {
	const permissions_id = req.body.id;
	const member = req.body.member;
	const link = req.body.resource;

	db.query(`SELECT access_to FROM permissions_by_member WHERE permissions_id = ${permissions_id}`, (err, results, fields) => {
		if (err) throw err;

		console.log(results);

		if (results[0].access_to === null) {
			db.query(`UPDATE permissions_by_member SET access_to = '${link}' WHERE permissions_id = ${permissions_id}`, (err, results, fields) => {
				if (err) throw err;

				console.log(results);
			})
		} else {
			db.query(`UPDATE permissions_by_member SET access_to = CONCAT(access_to, ', ${link}') WHERE permissions_id = ${permissions_id}`, (err, results, fields) => {
				if (err) throw err;

				console.log(results);
			})
		}
	})

	db.query(`SELECT access_to FROM permissions_by_resource WHERE original_link = '${link}'`, (err, results, fields) => {
		if (err) throw err;

		console.log(results);

		if (results[0].access_to === null) {
			db.query(`UPDATE permissions_by_resource SET access_to = '${member}' WHERE original_link = '${link}'`, (err, results, fields) => {
				if (err) throw err;

				console.log(results);

				res.redirect(`/app/manage_passwords/permissions_member/${permissions_id}`);
			})
		} else {
			db.query(`UPDATE permissions_by_resource SET access_to = CONCAT(access_to, ', ${member}') WHERE original_link = '${link}'`, (err, results, fields) => {
				if (err) throw err;
				
				console.log(results);

				res.redirect(`/app/manage_passwords/permissions_member/${permissions_id}`);
			})
		}
	})
})
*/
module.exports = router;
