const mongoose = require('mongoose');
const Cinema = require('./cinemaModel');

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
theaterSchema.index({ theaterNumber: 1, cinema: 1 }, { unique: true });

// theaterSchema.pre(/^find/, async function (next) {
//     this.find({ active: { $ne: false } });
//     next();
// });

theaterSchema.post('save', async function (doc, next) {
    const cinema = await Cinema.findById(doc.cinema);

    const theaters = [...cinema.theaters, doc.id];

    cinema.theaters = theaters;
    cinema.save({ validateBeforeSave: false });
});

module.exports = mongoose.model('Theater', theaterSchema);
