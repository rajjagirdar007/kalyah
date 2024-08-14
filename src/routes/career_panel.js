const path = require('path');
const express = require('express');

const router = express.Router();

const login = require(path.join(__dirname, "../middleware/login.js"));
const db = require(path.join(__dirname, "../tools/db_mycivvi.js"));

router.use(login.login_check);
/*
router.get('/', (req, res) => {
	res.render('career_panel/login.hbs');
})
*/

router.get('/logout', (req, res) => {
	req.session.destroy();
	res.redirect('/panel');
})

router.get('/', (req, res) => {
		
		let w = `SELECT position, count(*) AS count_position FROM kanban GROUP BY position;`;
		let e = `SELECT
		  career.id,
		  career.title,
		  career.location,
		  IFNULL(position_counts.count_position, 0) AS count_position
		FROM
		  career
		LEFT JOIN (
		  SELECT
		    position,
		    COUNT(*) AS count_position
		  FROM
		    kanban
		  GROUP BY
		    position
		) AS position_counts
		ON
		  career.title = position_counts.position;
		`	
		db.query(e, (err2, results2) => {
			if (err2) throw err2;
			res.render('career_panel/open_positions.hbs', { position: results2 })
	
		})

})

router.get('/applicants/:name', (req, res) => {
        var name = req.params.name;
	var q = `SELECT * FROM kanban WHERE position='${name}'`;
                db.query(q, (err2, results2) => {
                        if (err2) throw err2;
                        res.render('career_panel/applicants.hbs', { position: results2 })

                })
})

router.get('/add_career', (req, res) => {
	res.render('career_panel/add_career.hbs');
})

router.post('/add_career', (req, res) => {
	let r = req.body;
	let q = `INSERT INTO career VALUES (default, '${r.title}', '${r.location}', '${r.experience}', '${r.key_skills}', '${r.description}')`;
	db.query(q, (err, results) => {
		if (err) throw err;
		res.redirect('/panel/career/add_career');
	})
})

router.get('/delete_career/:id', (req, res) => {
	let id = req.params.id;
	let q = `DELETE FROM career WHERE id = ${id}`;
	db.query(q, (err, results) => {
		if (err) throw err;
		res.redirect('/panel/career/open_positions');
	})
})

router.get('/position/:id', (req, res) => {
	let id = req.params.id;
	let q = `SELECT * FROM career WHERE id = ${id}`;
	db.query(q, (err, results) => {
		if (err) throw err;
		res.render('career_panel/career_details.hbs', { data: results })
	})
})

router.post('/edit_career', (req, res) => {
	let r = req.body;
	let q = `UPDATE	career SET title = '${r.title}', location = '${r.location}', experience = '${r.experience}', key_skills = '${r.key_skills}', desc = '${r.description}' WHERE id = ${r.id};`; 
	db.query(q, (err, results) => {
		if (err) throw err;
		res.redirect(`/panel/career/position/${r.id}`);
	})
})

module.exports = router;
