const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    googleId: {
        type: String,
        require: true,
        unique: true,
    },
    photo: {
        type: String,
        require: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    role: {
        type: String,
        default: 'user',
        select: false,
        unmodifiable: true,
    },
});

module.exports = mongoose.model('User', userSchema);
