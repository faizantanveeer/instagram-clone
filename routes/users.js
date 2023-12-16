const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/instagramclone');
const plm = require('passport-local-mongoose');


const userSchema = new mongoose.Schema({
	username: String,
	fullname: String,
	password: String,
	photoPath: {
		type: String,
		default: 'profile.jpg'
	},
	bio: String,
	email: String,
	posts: [
	  {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'post',
	  },
	],
  });

userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);
