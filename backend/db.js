const mongoose = require('mongoose');
const mongoURI = "mongodb://localhost:27017/iNotebook"; // Add your database name

const connectToMongo = () => {
    mongoose.connect(mongoURI)
        .then(() => {
            console.log("Connected to MongoDB successfully!");
        })
        .catch((err) => {
            console.error("MongoDB connection error:", err);
        });
}

module.exports = connectToMongo;
