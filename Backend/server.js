import app from './src/app.js';
import connectDB from './src/db/db.js';
import config from './src/config/config.js';
import mongoose from 'mongoose';

let server;

connectDB()
    .then(() => {
        const port = config.PORT || 3000;
        server = app.listen(port, () => {
            console.log(`Server is running on address: http://localhost:${port}/`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed: ", err);
        process.exit(1);
    });

// Graceful shutdown handlers
const exitHandler = () => {
    if (server) {
        server.close(async () => {
            console.log("HTTP server closed.");
            try {
                if (mongoose.connection.readyState === 1) {
                    await mongoose.connection.close();
                    console.log("MongoDB connection closed.");
                }
            } catch (err) {
                console.error("Error closing MongoDB connection:", err);
            } finally {
                process.exit(0);
            }
        });
    } else {
        process.exit(0);
    }
};

const unexpectedErrorHandler = (error) => {
    console.error("Unexpected error:", error);
    exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
    console.log("SIGTERM received");
    exitHandler();
});

process.on("SIGINT", () => {
    console.log("SIGINT received");
    exitHandler();
});