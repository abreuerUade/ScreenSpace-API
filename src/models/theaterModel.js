const mongoose = require('mongoose');
const Showtime = require('./showtimeModel');

const Schema = mongoose.Schema;

const theaterSchema = new Schema({
    theaterName: {
        type: String,
        required: true,
        // unique: true,
    },
    cinema: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cinema',
        required: true,
        // unique: true,
    },
    numberOfRows: {
        type: Number,
        required: true,
        min: 1,
    },
    numberOfCols: {
        type: Number,
        required: true,
        min: 1,
    },
    active: {
        type: Boolean,
        default: true,
    },
});
theaterSchema.index({ theaterName: 1, cinema: 1 }, { unique: true });

// theaterSchema.pre(/^find/, async function (next) {
//     this.find({ active: { $ne: false } });
//     next();
// });

theaterSchema.post(/elete$/, async function (doc, next) {
    await Showtime.deleteMany({ theater: doc._id });
    next();
});

module.exports = mongoose.model('Theater', theaterSchema);
