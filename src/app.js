// Dependencies
require('dotenv').config();
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const deserializeUser = require('./middleware/deserializeUser');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const compression = require('compression');
const ownerRoutes = require('./routes/v1/ownerRoutes');
const userRoutes = require('./routes/v1/userRoutes');
const cinemaRoutes = require('./routes/v1/cinemaRoutes');
const theaterRoutes = require('./routes/v1/theaterRoutes');
const movieRoutes = require('./routes/v1/movieRoutes');
const showtimeRoutes = require('./routes/v1/showtimeRoutes');
const bookingRoutes = require('./routes/v1/bookingRoutes');
const ratingRoutes = require('./routes/v1/ratingRoutes');

// App y middlewares
const app = express();

// app.enable('trust proxy');

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/favicon.ico', (req, res, next) => res.status(204).end());

app.use(cors());

app.options('*', cors());

app.use(express.json({ limit: '10kb' }));

// app.use(helmet());

// app.use(mongoSanitize());

// app.use(xss());

// app.use(compression());

// Routes

app.get('/api/v1/ping', (req, res) => {
    res.status(200).json({
        status: 'API working corrctly!!!',
    });
});
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'Welcome to ScreenSpace API',
    });
});

app.use(deserializeUser);

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/owners', ownerRoutes);
app.use('/api/v1/theaters', theaterRoutes);
app.use('/api/v1/cinemas', cinemaRoutes);
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/showtimes', showtimeRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/ratings', ratingRoutes);

app.all('*', (req, res, next) => {
    next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
