import { MongoClient } from "mongodb";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

(async () => {
  const client = new MongoClient(process.env.MONGO_URI);
  try {
    await client.connect();
    const db = client.db("reminder_app");
    const tasks = db.collection("tasks");
    const now = new Date();

    const upcomingReminders = await tasks
      .find({
        type: "reminder",
        status: "pending",
        reminderTime: { $lte: new Date(now.getTime() + 3 * 60 * 60 * 1000) },
        $or: [
          {
            "triggers.3h.sent": false,
            reminderTime: {
              $lte: new Date(now.getTime() + 3 * 60 * 60 * 1000),
            },
          },
          {
            "triggers.1h.sent": false,
            reminderTime: {
              $lte: new Date(now.getTime() + 1 * 60 * 60 * 1000),
            },
          },
          {
            "triggers.10m.sent": false,
            reminderTime: { $lte: new Date(now.getTime() + 10 * 60 * 1000) },
          },
          { "triggers.0m.sent": false, reminderTime: { $lte: now } },
        ],
      })
      .toArray();

    for (const reminder of upcomingReminders) {
      const timeLeft = (reminder.reminderTime - now) / (1000 * 60); // Minutes left
      let triggerType = null;

      if (timeLeft <= 0) triggerType = "0m";
      else if (timeLeft <= 10) triggerType = "10m";
      else if (timeLeft <= 60) triggerType = "1h";
      else if (timeLeft <= 180) triggerType = "3h";

      if (triggerType) {
        // Send Email
        const msg = {
          to: reminder.user.email,
          from: process.env.SENDER_EMAIL || "noreply@yourdomain.com",
          subject: `Reminder: ${reminder.name}`,
          text: `Hi! This is a reminder: ${reminder.description}\nTime: ${reminder.reminderTime}`,
        };

        await sgMail.send(msg);

        // Update DB
        await tasks.updateOne(
          { _id: reminder._id },
          {
            $push: {
              triggers: { type: triggerType, sent: true, sentAt: new Date() },
            },
            $set: { status: triggerType === "0m" ? "sent" : "pending" },
          }
        );
      }
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await client.close();
  }
})();

