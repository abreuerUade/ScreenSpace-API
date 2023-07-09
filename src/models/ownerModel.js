const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');
const Cinema = require('./cinemaModel');

const Schema = mongoose.Schema;
const ownerSchema = new Schema({
    name: {
        type: String,
        default: '',
    },
    password: {
        type: String,
        required: [true, 'Must provide a password'],
        minlength: 8,
        select: false,
    },
    photo: {
        type: String,
        default: '/images/default.jpg',
    },
    email: {
        type: String,
        require: [true, 'User must have a mail'],
        lowecase: true,
        unique: true,
        validate: [validator.isEmail, 'Enter valid email'],
    },
    role: {
        type: String,
        default: 'owner',
        select: false,
        unmodifiable: true,
    },
    passwordChangedAt: Date,
    emailToken: String,
    emailTokenExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    cinemas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cinema',
        },
    ],
});

ownerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
});

ownerSchema.post(/elete$/, async function (doc, next) {
    const cinemas = await Cinema.find({ owner: doc._id });

    cinemas.forEach(async cinema => {
        await Cinema.findByIdAndDelete(cinema._id);
    });
    next();
});

ownerSchema.methods.comparePassword = async function (candidatePass, userPass) {
    return await bcrypt.compare(candidatePass, userPass);
};

ownerSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

ownerSchema.methods.createEmailToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.emailToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.emailTokenExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('Owner', ownerSchema);
