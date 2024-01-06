const mongoose = require("mongoose");
// const colors = require("colors");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://admin:admin@cluster0.9rlkwuf.mongodb.net/?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('databse connected');
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1); // Exit with a non-zero status code to indicate an error
  }
};

module.exports = connectDB;

