var express = require('express');
const passport = require('passport');
var router = express.Router();
const userModel = require('./users');
const upload = require('./multer');
const postModel = require('./post');

const localStrategy = require('passport-local');
const post = require('./post');
passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function (req, res) {
	res.render('index', { footer: false });
});

router.post('/update', upload.single('file'), async function (req, res) {
	const user = await userModel.findOneAndUpdate(
		{ username: req.session.passport.user },
		{
			username: req.body.username,
			fullname: req.body.fullname,
			bio: req.body.bio,
		},
		{ new: true }
	);

	if (req.file) {
		user.photoPath = req.file.filename;
	}
	await user.save();

	res.redirect('/profile');
});

router.get('/upload', isLoggedIn, async function (req, res) {
	const userData = await userModel.findOne({
		username: req.session.passport.user,
	});

	res.render('upload', { footer: true, user: userData });
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

router.get('/feed', isLoggedIn, async function (req, res) {
	const postData = await postModel.find().populate('users');
	const userData = await userModel.findOne({
		username: req.session.passport.user,
	});

	res.render('feed', { footer: true, user: userData, posts: postData });
});

router.get('/user/post/:id', isLoggedIn, async function (req, res) {
	const user = await userModel.findOne({
		username: req.session.passport.user,
	});

	const id = req.params.id;

	const post = await postModel.findOne({
		_id: id
	})

	// if user has already like, delete user

	// if user didn't like, add new user

	if(post.likes.indexOf(user._id) === -1){
		post.likes.push(user._id);
	}else{
		post.likes.splice(post.likes.indexOf(user._id), 1);
	}

	await post.save()
	res.redirect('/feed');
});

// router.get('/post/delete/:id', isLoggedIn, async function(req, res){

	// const id = req.params.id;

	// await postModel.findOneAndDelete({ _id: id }, { $pull: { users: req.session.passport.user } });

	// res.redirect('/feed');	

// })

router.get('/profile', isLoggedIn, async function (req, res) {
	const userData = await userModel
		.findOne({
			username: req.session.passport.user,
		})
		.populate('posts');

	res.render('profile', { footer: true, user: userData });
});

router.get('/search', isLoggedIn, async function (req, res) {
	const user = await userModel.findOne({
		username: req.session.passport.user,
	});
	res.render('search', { footer: true, user: user });
});

router.get('/username/:username', isLoggedIn, async function (req, res) {
	const username = req.params.username;
	const regex = new RegExp(`^${username}`, 'i');

	const user = await userModel.find({
		username: regex,
	});
	res.json(user);
});

router.get('/edit', isLoggedIn, async function (req, res) {
	const userData = await userModel.findOne({
		username: req.session.passport.user,
	});

	res.render('edit', { footer: true, user: userData });
});

router.post(
	'/upload',
	isLoggedIn,
	upload.single('file'),
	async function (req, res) {
		const user = await userModel.findOne({
			username: req.session.passport.user,
		});

		const post = await postModel.create({
			photoPath: req.file.filename,
			caption: req.body.caption,
			users: user._id,
		});

		user.posts.push(post._id);
		await user.save();
		res.redirect('/feed');
	}
);

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
