const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
	caption: String,
	photoPath: String,
	users: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	likes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', postSchema);