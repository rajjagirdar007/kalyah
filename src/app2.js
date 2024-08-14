const path = require("path");
const express = require("express");
const session = require("express-session");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();

const routes = require(path.join(__dirname, "/routes/routes.js"));
const password = require(path.join(__dirname, "/routes/password.js"));
const share = require(path.join(__dirname, "/routes/share.js"));
//const register = require("/var/www/kalyah.com/src/middleware/register.js");

const publicDirPath = path.join(__dirname, "../public");
const viewsDirPath = path.join(__dirname, "../templates/views");

app.use(express.static(publicDirPath));

app.set("views engine", "hbs");
app.set("views", viewsDirPath);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
	secret: 'looks can be decieving...',
	saveUninitialized: true,
	resave: false,
	cookie: {
		secure: !true
	}
}));

app.use(cookieParser());

app.use("/passwords", password);
app.use("/share", share);

app.get("/", (req, res) => {
    res.render("index.hbs");
})

app.post("/login", (req, res) => {
	var u = req.body.username;
	var p = req.body.permission;

	req.session.loggedin = true;
	req.session.username = u;

	if (p == 'Admin') {
		req.session.role = "admin";
		res.send({ url: '/passwords' });
	} else if (p == 'User') {
		req.session.role = "member";
		res.send({ url: '/passwords' });
	}
})

app.get("/logout", (req, res) => {
	req.session.destroy();

	res.redirect("/?logout=true");
})

const port = 3003;
app.listen(port, () => {
    console.log(`kalyah.com up and running on port ${port}`);
})
