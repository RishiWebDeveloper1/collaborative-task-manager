import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import './Member.css'

const Member = ({ currentUser }) => {
    const [tasks, setTasks] = useState([]);
    const [message, setMessage] = useState("");

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get("email");

    const fetchTasks = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/tasks-member`, {
                params: { assignedTo: email }
            });
            setTasks(res.data);
        } catch (err) {
            console.error("Error fetching tasks:", err);
        }
    };

    useEffect(() => {
        if (email) {
            fetchTasks();
        }
    }, [email]);


    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, { status: newStatus });
            setMessage("Status updated");
            fetchTasks();
        } catch (err) {
            console.error("Error updating status:", err);
            setMessage("Failed to update status");
        }
    };

    return (
        <div className="member-dashboard">
            <h2>Welcome, {email}</h2>
            <h3>Your Assigned Tasks</h3>

            {tasks.length === 0 ? (
                <p>No tasks assigned yet.</p>
            ) : (
                tasks.map((task) => (
                    <div key={task._id} className="task-card">
                        <h4>{task.title}</h4>
                        <p>{task.description}</p>
                        <label>
                            Status:
                            <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </label>
                    </div>
                ))
            )}

            {message && <p style={{ color: "green" }}>{message}</p>}
        </div>
    );
};

export default Member;