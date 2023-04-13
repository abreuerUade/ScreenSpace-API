const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const requireUser = catchAsync(async (req, res, next) => {
  const user = res.locals.user;
  if (!user) {
    return next(new AppError("You need to be logged in", 403));
  }

  return next();
});

module.exports = requireUser;
