const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new AppError('No doc found with that id', 404));
        }

        res.status(200).json({
            status: 'success',
            data: null,
        });
    });

exports.updateOne = Model =>
    catchAsync(async (req, res, next) => {
        if (req.file) req.body.photo = `/images/cinemas/${req.file.filename}`;
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!doc) {
            return next(new AppError('No doc found with that id', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });

exports.createOne = Model =>
    catchAsync(async (req, res, next) => {
        if (res.locals.user.role === 'owner') {
            req.body = { ...req.body, owner: res.locals.user.id };
        } else {
            req.body = { ...req.body, user: res.locals.user.id };
        }
        if (req.file) req.body.photo = `/images/cinemas/${req.file.filename}`;
        const newDoc = await Model.create(req.body);
        res.status(200).json({
            status: 'success',
            data: newDoc,
        });
    });

exports.getOne = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);

        if (popOptions) query = query.populate(popOptions);

        const doc = await query;

        if (!doc) {
            return next(new AppError('No document found with that id', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });

exports.getAll = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        let query = Model.find();
        if (popOptions) query = query.populate(popOptions);
        const features = new APIFeatures(query, req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        if (req.query.startTime) {
            const ONE_DAY = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            const startTime = new Date(req.query.startTime);
            const finishTime = new Date(startTime.getTime() + ONE_DAY);

            features.query = features.query.find({
                startTime: {
                    $gte: startTime,
                    $lte: finishTime,
                },
            });
        }
        const doc = await features.query;

        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                doc,
            },
        });
    });
