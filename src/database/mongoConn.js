const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB, {
      // useCreateIndex: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      // useFindAndModify: false,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
