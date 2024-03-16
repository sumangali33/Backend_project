import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async function () {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`\n connection to database is succesful! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection error: " + error);
        process.exit(1);
    }
}

export default connectDB;