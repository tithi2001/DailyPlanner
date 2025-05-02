import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["note", "reminder"],
      required: true,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    reminderTime: {
      type: Date,
      required: function () {
        return this.type === "reminder";
      },
    },
    notifications: [
      {
        triggerType: String, // "3h", "1h", "10m", "0m"
        status: {
          type: String,
          enum: ["pending", "sent", "failed"],
          default: "pending",
        },
        sentAt: Date,
        error: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Task = mongoose.model("Task", taskSchema);




