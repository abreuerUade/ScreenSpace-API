// Dependencies
require('dotenv').config();
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const ownerRoutes = require('./routes/v1/ownerRoutes');
const cinemaRoutes = require('./routes/v1/cinemaRoutes');
const theaterRoutes = require('./routes/v1/theaterRoutes');
const movieRoutes = require('./routes/v1/movieRoutes');
const showtimeRoutes = require('./routes/v1/showtimeRoutes');
const bookingRoutes = require('./routes/v1/bookingRoutes');
const deserializeUser = require('./middleware/deserializeUser');

// App y middlewares
const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.static('public'));

app.use(express.json({ limit: '10kb' }));

// Routes

app.get('/api/v1/ping', (req, res, next) => {
    res.status(200).json({ status: 'API y working corrctly' });
    next();
});

app.use(deserializeUser);
app.use('/api/v1/owners', ownerRoutes);
app.use('/api/v1/theaters', theaterRoutes);
app.use('/api/v1/cinemas', cinemaRoutes);
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/showtimes', showtimeRoutes);
app.use('/api/v1/bookings', bookingRoutes);

app.all('*', (req, res, next) => {
    next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
