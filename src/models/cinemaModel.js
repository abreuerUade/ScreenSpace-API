const mongoose = require('mongoose');
const Theater = require('./theaterModel');

const Schema = mongoose.Schema;

const cinemaSchema = new Schema({
    company: {
        type: String,
        required: [true, 'Cinema must have a company name'],
    },
    name: {
        type: String,
        required: [true, 'Cinema must have a name'],
    },
    photo: { type: String },
    address: {
        street: { type: String },
        number: { type: String },
        county: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        postalCode: { type: String },
    },
    location: {
        // GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        },
    },
    theaters: [{ type: Schema.Types.ObjectId, default: [], ref: 'Theater' }],
    active: { type: Boolean, default: true },
    owner: {
        type: Schema.Types.ObjectId,
        // select: false,
        ref: 'Owner',
    },
});

cinemaSchema.index({ company: 1, name: 1 }, { unique: true });

cinemaSchema.post(/elete$/, async function (doc, next) {
    const theaters = await Theater.find({ cinema: doc._id });

    theaters.forEach(async theater => {
        await Theater.findByIdAndDelete(theater._id);
    });
    next();
});

module.exports = mongoose.model('Cinema', cinemaSchema);
