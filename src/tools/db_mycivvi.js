const mysql = require('mysql');

const connection = mysql.createConnection({
	host:'127.0.0.1',
	user:'kalyakk',
	password:'Password1!',
	database:'mycivvi'
});

connection.connect((err)=>{
	if (err) throw err;
	console.log('Connected to mycivvi DB!');
});

module.exports = connection; 
