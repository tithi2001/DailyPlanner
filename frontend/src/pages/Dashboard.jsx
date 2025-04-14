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
  const [filterType, setFilterType] = useState("all");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

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
      setFilterType("all");
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
    setFilterType(task.type); // Apply filter during edit for visual clarity
  };

  const handleTypeChange = (e) => {
    const selected = e.target.value;
    if (selected === "all") {
      setType("note"); // Default for task creation
      setFilterType("all");
    } else {
      setType(selected);
      setFilterType(selected);
    }
  };

  const filteredTasks =
    filterType === "all"
      ? tasks
      : tasks.filter((task) => task.type === filterType);

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
          <select value={filterType} onChange={handleTypeChange}>
            <option value="all">All</option>
            <option value="note">Note</option>
            <option value="reminder">Reminder</option>
          </select>
          <button type="submit">{editTaskId ? "Update" : "Add"} Task</button>
        </form>

        {/* Task List */}
        <div className="task-list">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div key={task._id} className={`task-card ${task.type}`}>
                <h3>{task.name}</h3>
                <p>{task.description}</p>
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
            ))
          ) : (
            <p>No tasks found for selected type.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
