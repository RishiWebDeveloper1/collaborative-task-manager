import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Admin.css';

const Manager = () => {
    const [tasks, setTasks] = useState([]);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterAssignee, setFilterAssignee] = useState('');

    const [form, setForm] = useState({
        title: '',
        description: '',
        assignedTo: '',
        status: 'To Do'
    });

    const fetchTasks = async () => {
        try {
            let query = '';

            if (filterStatus) query += `?status=${filterStatus}`;
            if (filterAssignee) {
                query += query ? `&assignedTo=${filterAssignee}` : `?assignedTo=${filterAssignee}`;
            }

            const res = await axios.get(`${import.meta.env.VITE_API_URL}/tasks${query}`);
            console.log("Fetched tasks:", res.data);
            setTasks(res.data);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        }
    };


    useEffect(() => {
        fetchTasks();
    }, [filterStatus, filterAssignee]);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${id}`);
            fetchTasks();
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const handleCreate = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/tasks-send`, form);
            setForm({ title: '', description: '', assignedTo: '', status: 'To Do' });
            fetchTasks();
        } catch (err) {
            console.error('Create error:', err);
        }
    };

    const [userForm, setUserForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "Member"
    });

    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/users-send`, userForm);
            setMessage(res.data.message);
            setUserForm({ name: "", email: "", password: "", role: "Member" });
        } catch (err) {
            setMessage(err.response?.data?.message || "Error creating user");
            console.error("Create user error:", err);
        }
    };


    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`);
                setUsers(res.data);
            } catch (err) {
                console.error("Error fetching users:", err);
            }
        };

        fetchUsers();
    }, []);


    return (
        <div className="admin-dashboard">
            <h2>Manager Dashboard</h2>

            <div className="filter-container">
                <select onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus}>
                    <option value=''>All Statuses</option>
                    <option value='To Do'>To Do</option>
                    <option value='In Progress'>In Progress</option>
                    <option value='Done'>Done</option>
                </select>

                <input
                    type="text"
                    placeholder="Filter by Assignee"
                    value={filterAssignee}
                    onChange={(e) => setFilterAssignee(e.target.value)}
                />
            </div>

            <div className="task-form">
                <h3>Create Task</h3>

                <input
                    type="text"
                    placeholder="Title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                />

                <textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                ></textarea>

                <select
                    value={form.assignedTo}
                    onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                >
                    <option value="">-- Select Assignee --</option>
                    {users.map((user) =>
                        user.role === "Member" ? (
                            <option key={user._id} value={user.name}>
                                {user.name}
                            </option>
                        ) : null
                    )}
                </select>

                <select
                    value={form.createdBy}
                    onChange={(e) => setForm({ ...form, createdBy: e.target.value })}
                >
                    <option value="">-- Select Creator --</option>
                    {users.map((user) =>
                        user.role === "Manager" || user.role === "Admin" ? (
                            <option key={user._id} value={user.name}>
                                {user.name}
                            </option>
                        ) : null
                    )}
                </select>

                <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>

                <button onClick={handleCreate}>Create Task</button>
            </div>


            {Array.isArray(tasks) ? tasks.map((task) => (
                <div className="task-item" key={task._id}>
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                    <p><strong>Assigned To:</strong> {task.assignedTo || 'N/A'}</p>
                    <p><strong>Status:</strong> {task.status}</p>
                    <button onClick={() => handleDelete(task._id)}>Delete</button>
                </div>
            )) : <p>No tasks found.</p>}

        </div>
    );
};

export default Manager;
