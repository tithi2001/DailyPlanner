import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDb = async () => {
    console.log(process.env.MONGO_URI);
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      "Database connected..",
      connect.connection.host,
      connect.connection.name
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
export default connectDb;
