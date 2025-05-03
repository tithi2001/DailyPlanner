import { Task } from "../models/task.js";
import { User } from "../models/user.js";
import asyncHandler from "express-async-handler";

export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user.id }).sort({ updatedAt: -1 });
  res.status(200).json(tasks);
});

export const createTask = asyncHandler(async (req, res) => {
  const { name, description, type, reminderTime } = req.body;

  // Validation
  if (!name || !description || !type) {
    res.status(400);
    throw new Error("All fields are required");
  }
  if (type === "reminder" && !reminderTime) {
    res.status(400);
    throw new Error("Reminder time is required for reminder tasks");
  }

  // Get user email
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const task = new Task({
    user: req.user.id,
    email: req.user.email, // Store user's email
    name,
    description,
    type,
    reminderTime: type === "reminder" ? reminderTime : undefined,
    notifications: [], // Initialize empty notifications array
  });

  await task.save();
  res.status(201).json(task);
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  if (task.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to update this task");
  }

  if (req.body.type === "reminder" && !req.body.reminderTime) {
    res.status(400);
    throw new Error("Reminder time is required for reminder tasks");
  }

  // Preserve notifications when updating
  const notifications = task.notifications;
  Object.assign(task, req.body);
  task.notifications = notifications;

  await task.save();
  res.json(task);
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  if (task.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to delete this task");
  }

  await task.deleteOne();
  res.json({ message: "Task deleted successfully" });
});

// NEW: Get notification history for a task
export const getTaskNotifications = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  res.json({
    taskId: task._id,
    notifications: task.notifications || [],
  });
});
