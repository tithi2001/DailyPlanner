import express from "express";
import {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
  getTaskNotifications,
} from "../controllers/taskController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getTasks);
router.post("/", authMiddleware, createTask);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);
router.get("/:id/notifications", authMiddleware, getTaskNotifications);

export default router;


