import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./backend/routes/authRoutes.js";
import taskRoutes from "./backend/routes/taskRoutes.js";
import connectDB from './backend/config/db.js';

dotenv.config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/users", authRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`Server is running on port ${PORT}`));




export default app;

