const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const options = {
	host: "192.168.1.112",
	user: "kmanager",
	password: `,J!VcxG6]pETr"M4`,
	database: "kalyah",
	createDatabaseTable: true,
	schema: {
		tableName: "user_sessions",
		columnNames: {
			session_id: "session_id",
			expires: "expires",
			data: "data"
		}	
	}
};

const sessionStore = new MySQLStore(options)

module.exports = {
	key: "user_sid",
	secret: ["playing_posum", "needle_in_a_haystack", "yada_yada"],
	store: sessionStore,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		sameSite: true,
		maxAge: 3600000
	}
}
