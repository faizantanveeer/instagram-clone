var express = require('express');
const passport = require('passport');
var router = express.Router();
const userModel = require('./users');
const upload = require('./multer');

const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function (req, res) {
	res.render('index', { footer: false });
});

router.post('/update', upload.single('file'), async function (req, res) {
	const user = await userModel.findOne({
		username: req.session.passport.user,
	});

	await userModel.updateOne({
		username: req.body.username,
		fullname: req.body.fullname,
		bio: req.body.bio,
		photoPath: req.file.filename,
	})

	res.redirect('/profile');
});

router.get('/login', async function (req, res) {
	const userData = new userModel({
		username: req.body.username,
		email: req.body.email,
		fullname: req.body.fullname,
		password: req.body.password,
	});
	res.render('login', { footer: false, user: userData });
});

router.get('/feed', isLoggedIn, function (req, res) {
	res.render('feed', { footer: true });
});

router.get('/profile', isLoggedIn, async function (req, res) {
	const userData = await userModel.findOne({
		username: req.session.passport.user,
	});

	res.render('profile', { footer: true, user: userData });
});

router.get('/search', isLoggedIn, function (req, res) {
	res.render('search', { footer: true });
});

router.get('/edit', isLoggedIn, async function (req, res) {
	const userData = await userModel.findOne({
		username: req.session.passport.user,
	});


	res.render('edit', { footer: true, user: userData });
});

router.get('/upload', isLoggedIn, function (req, res) {
	res.render('upload', { footer: true });
});

router.post('/register', function (req, res) {
	const { username, email, fullname } = req.body;
	const newUser = new userModel({ username, email, fullname });

	userModel.register(newUser, req.body.password).then(function () {
		passport.authenticate('local')(req, res, function () {
			res.redirect('/profile');
		});
	});
});

router.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/profile',
		failureRedirect: '/',
	}),
	function (req, res) {}
);

router.get('/logout', function (req, res) {
	req.logout(function (err) {
		if (err) {
			return next(err);
		}
		res.redirect('/login');
	});
});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}
module.exports = router;
