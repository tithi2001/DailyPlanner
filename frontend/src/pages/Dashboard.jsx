import React, { useEffect, useState } from "react";
import axios from "axios";
import "./dashboard.css";
import Logout from "./logOut";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("note");
  const [editTaskId, setEditTaskId] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderTime, setReminderTime] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const sorted = res.data.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );

      setTasks(sorted);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = { name, description, type };
      if (type === "reminder" && reminderTime) {
        taskData.reminderTime = reminderTime;
      }

      let res;

      if (editTaskId) {
        res = await axios.put(
          `http://localhost:5000/api/tasks/${editTaskId}`,
          taskData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTasks((prev) =>
          prev
            .map((task) => (task._id === editTaskId ? res.data : task))
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );
        setEditTaskId(null);
      } else {
        res = await axios.post("http://localhost:5000/api/tasks", taskData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTasks((prev) =>
          [...prev, res.data].sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          )
        );
      }

      setName("");
      setDescription("");
      setReminderTime("");
      setShowNoteModal(false);
      setShowReminderModal(false);
      setType(filterType !== "all" ? filterType : "note");
    } catch (error) {
      console.error("Error saving task", error);
      alert("Failed to save task");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (error) {
      console.error("Failed to delete task", error);
      alert("Failed to delete task");
    }
  };

  const handleEdit = (task) => {
    setEditTaskId(task._id);
    setName(task.name);
    setDescription(task.description);
    setType(task.type);
    setFilterType(task.type);
    if (task.type === "reminder") {
      setReminderTime(task.reminderTime || "");
      setShowReminderModal(true);
    } else {
      setShowNoteModal(true);
    }
  };

  const handleTypeChange = (e) => {
    const selected = e.target.value;
    if (selected === "all") {
      setType("note");
      setFilterType("all");
    } else {
      setType(selected);
      setFilterType(selected);
    }
  };

  const openNoteModal = () => {
    setType("note");
    setName("");
    setDescription("");
    setEditTaskId(null);
    setShowNoteModal(true);
  };

  const openReminderModal = () => {
    setType("reminder");
    setName("");
    setDescription("");
    setReminderTime("");
    setEditTaskId(null);
    setShowReminderModal(true);
  };

  const filteredTasks =
    filterType === "all"
      ? tasks
      : tasks.filter((task) => task.type === filterType);

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <h1>Daily Planner</h1>
        <div className="sidebar-buttons">
          <button className="note-button" onClick={openNoteModal}>
            Add Note
          </button>
          <button className="reminder-button" onClick={openReminderModal}>
            Add Reminder
          </button>
        </div>
        <select value={filterType} onChange={handleTypeChange}>
          <option value="all">All Tasks</option>
          <option value="note">Notes</option>
          <option value="reminder">Reminders</option>
        </select>
        <Logout />
      </aside>

      <main className="dashboard-main">
        <div className="task-list">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div key={task._id} className={`task-card ${task.type}`}>
                <div className="task-title">
                  <h3>{task.name}</h3>
                  <span className="task-type">{task.type}</span>
                </div>
                <p>{task.description}</p>
                {task.type === "reminder" && task.reminderTime && (
                  <p className="reminder-time">
                    ⏰ {new Date(task.reminderTime).toLocaleString()}
                  </p>
                )}
                <small>
                  {task.updatedAt !== task.createdAt
                    ? `Updated: ${new Date(task.updatedAt).toLocaleString()}`
                    : `Created: ${new Date(task.createdAt).toLocaleString()}`}
                </small>
                <div className="button-group">
                  <button onClick={() => handleEdit(task)}>Edit</button>
                  <button onClick={() => handleDelete(task._id)}>Delete</button>
                </div>
              </div>
            ))
          ) : (
            <p>No tasks found.</p>
          )}
        </div>

        {/* Note Modal */}
        {/* Add Note Modal */}
        {showNoteModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">Add Note</div>
              <div className="modal-body">
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Title"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <textarea
                  className="modal-input modal-textarea"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-button modal-button-cancel"
                  onClick={() => setShowNoteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="modal-button modal-button-submit"
                  onClick={handleSubmit}
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Reminder Modal */}
        {showReminderModal && (
          <div className="modal-overlay">
            <div className="modal reminder-modal">
              <div className="modal-header">Add Reminder</div>
              <div className="modal-body">
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Title"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <textarea
                  className="modal-input modal-textarea"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                <input
                  type="datetime-local"
                  className="modal-input datetime-input"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  required
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-button modal-button-cancel"
                  onClick={() => setShowReminderModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="modal-button modal-button-submit"
                  onClick={handleSubmit}
                >
                  Add Reminder
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
