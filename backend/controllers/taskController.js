import { Task } from "../models/task.js";
import asyncHandler from "express-async-handler";

export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user.id }).sort({ updatedAt: -1 });
  res.status(200).json(tasks);
});

export const createTask = asyncHandler(async (req, res) => {
    const { name, description, type } = req.body;
     if (!name || !description || !type) {
       res.status(400);
       throw new Error("All fields are required");
  }
    const task = new Task({ user: req.user.id, name, description, type });
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
  Object.assign(task, req.body);
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