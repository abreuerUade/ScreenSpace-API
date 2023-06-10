const mongoose = require('mongoose');
const Owner = require('./ownerModel');

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

// cinemaSchema.pre('save', async function (next) {
//     const address = this.address;

//     const addressString = `direccion=${address.street} ${address.number}&localidad_censal=${address.county}&provincia=${address.state}`;

//     const data = await fetch(
//         `https://apis.datos.gob.ar/georef/api/direcciones?${addressString}`
//     ).then(response => response.json());

//     if (data.direcciones.length === 0) {
//         return next(new AppError('Invalid Address', 400));
//     }
//     const validAddress = data.direcciones[0];

//     address.street = validAddress.calle.nombre;
//     address.number = validAddress.altura.valor;
//     address.county = validAddress.departamento.nombre;
//     address.city = validAddress.localidad_censal.nombre;
//     address.state = validAddress.provincia.nombre;
//     address.country = 'ARGENTINA';
//     this.localization.lat = validAddress.ubicacion.lat;
//     this.localization.lon = validAddress.ubicacion.lon;

//     next();
// });

// cinemaSchema.pre(/^find/, async function (next) {
//     this.find({ active: { $ne: false } });
//     next();
// });

cinemaSchema.post('save', async function (doc, next) {
    const owner = await Owner.findById(doc.owner);

    const newCinemas = [...owner.cinemas, this.id];

    owner.cinemas = newCinemas;
    await owner.save({ validateBeforeSave: false });

    next();
});
// cinemaSchema.pre(/^find/, function (next) {
//     // La regex es para q funcione para todos los find
//     // this.find({ active: { $ne: false } });
//     next();/elete$/
// });

cinemaSchema.post(/elete$/, async function (doc, next) {
    const owner = await Owner.findById(doc.owner);

    const cinemas = owner.cinemas.filter(
        cinema => JSON.stringify(cinema) !== JSON.stringify(doc.id)
    );

    owner.cinemas = cinemas;
    await owner.save({ validateBeforeSave: false });
    next();
});

module.exports = mongoose.model('Cinema', cinemaSchema);
