const path = require("path");

const { encrypt, decrypt } = require(path.join(__dirname, "../crypto.js"));
const db = require(path.join(__dirname, "../db.js"));
const date = require(path.join(__dirname, "../date.js"));

module.exports.add = (req, res, next) => {
	const url = req.body.url;
	const u = req.body.username;
	const p = req.body.password;
	const notes = req.body.notes;
	
	let domain = extractRootDomain(url);

	const encrypt_pass = encrypt(p);

	let q = `INSERT INTO passwords(username, original_link, company_website, cred_user, cred_pass, date_added, additional_notes) VALUES ('${req.session.username}', '${url}', '${domain}', '${u}', '${encrypt_pass}', '${date()}', '${notes}')` 
	db.query(q, (err, results, fields) => {
		if (err) {
			console.log(err);
			res.render("add_password.hbs", {
				err_msg: "Try adding the password again!"
			})
		} else {
			next();
		}
	})
}

module.exports.delete_pass = (req, res, next) => {
	const pass_id = req.body.pass_id;
	const url = req.body.og_link;

	db.query(`DELETE FROM passwords WHERE password_id = ${pass_id}`, (err, results, fields) => {
		if (err) {
			res.render("/var/www/kalyah.com/templates/views/lists.hbs", {
				err_msg: "Try deleting the password again!"
			})
		}

		console.log(results);

		db.query(`DELETE FROM permissions_module WHERE original_link = '${url}'`, (err, results, fields) => {
			if (err) {
				console.log(err);
			}

			console.log(results);
		})

		next();
	})
}

function extractRootDomain(url) {
  var domain = extractHostname(url),
  splitArr = domain.split('.'),
  arrLen = splitArr.length;

  //extracting the root domain here
  //if there is a subdomain
  if (arrLen > 2) {
    domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
    //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
    if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
      //this is using a ccTLD
      domain = splitArr[arrLen - 3] + '.' + domain;
    }
  }
  return domain;
}

function extractHostname(url) {
  var hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("//") > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }

  //find & remove port number
  hostname = hostname.split(':')[0];
  //find & remove "?"
  hostname = hostname.split('?')[0];

  return hostname;
}
