const mysql = require('mysql');

const connection = mysql.createConnection({
	host:'192.168.152.3',
	user:'kalyak',
	password:'p3Nr.R7W',
	database:'kalyah'
});

connection.connect((err)=>{
	if (err) throw err;

	console.log('Connected to Hobo - KALYAH');
})

module.exports = connection;
