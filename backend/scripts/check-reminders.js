import { MongoClient } from "mongodb";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const mongoUri = process.env.MONGO_URI;
const sendgridApiKey = process.env.SENDGRID_API_KEY;
const senderEmail = process.env.EMAIL_SENDER;

console.log("MONGO_URI:", mongoUri);
console.log("SENDGRID_API_KEY:", sendgridApiKey);
console.log("SENDER_EMAIL:", senderEmail);

sgMail.setApiKey(sendgridApiKey);

async function checkRemindersAndSendEmail() {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db("todo");
    const tasks = db.collection("tasks");

    const now = new Date();
    console.log(typeof (now));
    
    const reminders = await tasks
      .find({
        type: "reminder",
        reminderTime: { $lte: now },
      })
      .toArray();
    
    console.log(now);
    console.log(reminders);

    for (const reminder of reminders) {
      const msg = {
        to: reminder.email,
        from: senderEmail,
        subject: `Reminder: ${reminder.name}`,
        text: reminder.description || "You have a scheduled reminder.",
      };

      try {
        await sgMail.send(msg);
        console.log(`Email sent to ${reminder.email}`);
      } catch (err) {
        console.error("SendGrid error:", err.response?.body || err.message);
      }
    }
  } catch (err) {
    console.error("MongoDB error:", err.message);
  } finally {
    await client.close();
  }
}

checkRemindersAndSendEmail();
