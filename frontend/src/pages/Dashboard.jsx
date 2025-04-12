import React, { useEffect, useState } from "react";
import axios from "axios";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("note");
  const [editTaskId, setEditTaskId] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(res.data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Create task
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = { name, description, type };
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
          prev.map((task) => (task._id === editTaskId ? res.data : task))
        );
        setEditTaskId(null);
      } else {
        res = await axios.post("http://localhost:5000/api/tasks", taskData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTasks((prev) => [...prev, res.data]);
      }

      setName("");
      setDescription("");
      setType("note");
    } catch (error) {
      console.error("Error saving task", error);
      alert("Failed to save task");
    }
  };

  // Delete task
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

  // Edit task
  const handleEdit = (task) => {
    setEditTaskId(task._id);
    setName(task.name);
    setDescription(task.description);
    setType(task.type);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Daily Planner</h1>

        {/* Task Form */}
        <form className="task-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Task name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="note">Note</option>
            <option value="reminder">Reminder</option>
          </select>
          <button type="submit">{editTaskId ? "Update" : "Add"} Task</button>
        </form>

        {/* Task List */}
        <div className="task-list">
          {tasks.length > 0 &&
            tasks.map((task) => (
              <div key={task._id} className={`task-card ${task.type}`}>
                <h3>{task.name}</h3>
                <p>{task.description}</p>
                {/* <p>Type: {task.type}</p> */}
                <div className="task-type-icon">
                  {task.type === "note" ? (
                    <span title="Note" className="note-icon">
                      ✏️
                    </span>
                  ) : (
                    <span title="Reminder" className="reminder-icon">
                      🔔
                    </span>
                  )}
                </div>

                <small>
                  Created: {new Date(task.createdAt).toLocaleString()}
                </small>
                <div className="button-group">
                  <button className="edit-btn" onClick={() => handleEdit(task)}>
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(task._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
