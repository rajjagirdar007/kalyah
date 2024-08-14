const path = require('path')
const express = require('express');
const body_parser = require('body-parser');
const session = require('express-session');
const hbs = require('hbs');

const app = express();
const port = 3039;

const public_directory = path.join(__dirname, "../public");
const views_directory = path.join(__dirname, "../templates/views");

const login = require(path.join(__dirname, "./routes/login.js"));
const panel = require(path.join(__dirname, "./routes/career_panel.js"));

app.set('views', views_directory);
app.set('view engine', '.hbs');
app.use(express.static(public_directory));
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));
app.use(session({ secret: 'whitehousechipsandscienceactq04u2039rfewj', resave: false, saveUninitialized: true }));

app.use('/login', login);
app.use('/panel', panel);
app.get('/', (req, res) => {
	res.render('login');
})

app.listen(port, () => {
	console.log(`kalyah.com is running on port ${port}!`);
})
