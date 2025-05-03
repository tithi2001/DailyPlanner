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
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [dateError, setDateError] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
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

  const isReminderFormValid = () => {
    if (!name || !description || !reminderDate || !reminderTime) {
      return false;
    }
    const now = new Date();
    const reminderDateTime = new Date(`${reminderDate}T${reminderTime}:00`);
    return reminderDateTime > now;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const taskData = { name, description, type };
      if (type === "reminder") {
        const reminderDateTime = `${reminderDate}T${reminderTime}:00`;
        taskData.reminderTime = reminderDateTime;
        taskData.sentFlag = false;
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
      setReminderDate("");
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
    setName(task.name);
    setDescription(task.description);
    setType(task.type);
    setEditTaskId(task._id);

    if (task.type.toLowerCase() === "note") {
      setShowNoteModal(true);
    } else if (task.type.toLowerCase() === "reminder") {
      if (task.reminderTime) {
        const [date, time] = task.reminderTime.split("T");
        setReminderDate(date);
        setReminderTime(time.slice(0, 5));
      }
      setShowReminderModal(true);
    }
  };

  const handleTypeChange = (e) => {
    const selected = e.target.value;
    setShowFavorites(false);
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
    setReminderDate("");
    setReminderTime("");
    setEditTaskId(null);
    setShowReminderModal(true);
  };

  const toggleFavorite = async (taskId, currentFavoriteStatus) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}`,
        { favorite: !currentFavoriteStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? res.data : task))
      );
    } catch (error) {
      console.error("Failed to update favorite status", error);
    }
  };

  const filteredTasks =
    filterType === "all"
      ? tasks
      : tasks.filter((task) => task.type === filterType);

  const favoriteNotes = tasks.filter(
    (task) => task.favorite && task.type === "note"
  );

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
        <button
          className={`favorite-button ${showFavorites ? "active" : ""}`}
          onClick={() => setShowFavorites(!showFavorites)}
        >
          Favorites
        </button>
        <Logout />
      </aside>

      <main className="dashboard-main">
        <div className="task-list">
          {showFavorites ? (
            favoriteNotes.length > 0 ? (
              favoriteNotes.map((task) => (
                <div key={task._id} className={`task-card ${task.type}`}>
                  <div className="task-title">
                    <h3>{task.name}</h3>
                    <div>
                      <span className="task-type">{task.type}</span>
                      <span
                        className={`favorite-star ${
                          task.favorite ? "active" : ""
                        }`}
                        onClick={() => toggleFavorite(task._id, task.favorite)}
                      >
                        ★
                      </span>
                    </div>
                  </div>
                  <p>{task.description}</p>
                  <small>
                    {task.updatedAt !== task.createdAt
                      ? `Updated: ${new Date(task.updatedAt).toLocaleString()}`
                      : `Created: ${new Date(task.createdAt).toLocaleString()}`}
                  </small>
                  <div className="button-group">
                    <button
                      onClick={() => handleEdit(task)}
                      className={`edit-button ${
                        task.type === "reminder" ? "reminder-edit" : ""
                      }`}
                    >
                      Edit
                    </button>
                    
                    <button onClick={() => handleDelete(task._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No favorite notes found.</p>
            )
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div key={task._id} className={`task-card ${task.type}`}>
                <div className="task-title">
                  <h3>{task.name}</h3>
                  <div>
                    <span className="task-type">{task.type}</span>
                    {task.type === "note" && (
                      <span
                        className={`favorite-star ${
                          task.favorite ? "active" : ""
                        }`}
                        onClick={() => toggleFavorite(task._id, task.favorite)}
                      >
                        ★
                      </span>
                    )}
                  </div>
                </div>
                <p>{task.description}</p>
                {task.type === "reminder" && task.reminderTime && (
                  <div className="reminder-time">
                    <span>Remind Me:</span>
                    <span>
                      {new Date(task.reminderTime)
                        .toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                        .replace(/,/g, "")
                        .replace(/(\d+:\d+)/, "$1") +
                        (new Date(task.reminderTime).getHours() >= 12
                          ? "PM"
                          : "AM")}
                    </span>
                  </div>
                )}
                <small>
                  {task.updatedAt !== task.createdAt
                    ? `Updated: ${new Date(task.updatedAt).toLocaleString()}`
                    : `Created: ${new Date(task.createdAt).toLocaleString()}`}
                </small>
                <div className="button-group">
                  <button
                    onClick={() => handleEdit(task)}
                    className={`edit-button ${
                      task.type === "reminder" ? "reminder-edit" : ""
                    }`}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(task._id)}>Delete</button>
                </div>
              </div>
            ))
          ) : (
            <p>No tasks found.</p>
          )}
        </div>

        {/* Note Modal */}
        {showNoteModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                {editTaskId ? "Edit Note" : "Add Note"}
              </div>
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
                  {editTaskId ? "Update Note" : "Add Note"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reminder Modal */}
        {showReminderModal && (
          <div className="modal-overlay">
            <div className="modal reminder-modal">
              <div className="modal-header">
                {editTaskId ? "Edit Reminder" : "Add Reminder"}
              </div>
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
                <div className="datetime-picker">
                  <label>Date & Time</label>
                  <input
                    type="date"
                    className="modal-input"
                    value={reminderDate}
                    onChange={(e) => {
                      setReminderDate(e.target.value);
                      if (e.target.value && reminderTime) {
                        const selectedDateTime = new Date(
                          `${e.target.value}T${reminderTime}:00`
                        );
                        setDateError(
                          selectedDateTime <= new Date()
                            ? "Please select a future date and time"
                            : ""
                        );
                      }
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                  <input
                    type="time"
                    className="modal-input"
                    value={reminderTime}
                    onChange={(e) => {
                      setReminderTime(e.target.value);
                      if (reminderDate && e.target.value) {
                        const selectedDateTime = new Date(
                          `${reminderDate}T${e.target.value}:00`
                        );
                        setDateError(
                          selectedDateTime <= new Date()
                            ? "Please select a future date and time"
                            : ""
                        );
                      }
                    }}
                    min={
                      reminderDate === new Date().toISOString().split("T")[0]
                        ? `${new Date()
                            .getHours()
                            .toString()
                            .padStart(2, "0")}:${(new Date().getMinutes() + 1)
                            .toString()
                            .padStart(2, "0")}`
                        : "00:00"
                    }
                    required
                  />
                  {dateError && <p className="error-message">{dateError}</p>}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-button modal-button-cancel"
                  onClick={() => {
                    setShowReminderModal(false);
                    setDateError("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`modal-button ${
                    isReminderFormValid()
                      ? "modal-button-submit"
                      : "modal-button-disabled"
                  }`}
                  onClick={isReminderFormValid() ? handleSubmit : undefined}
                  disabled={!isReminderFormValid()}
                >
                  {editTaskId ? "Update Reminder" : "Add Reminder"}
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


