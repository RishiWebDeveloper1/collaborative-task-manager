import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Task } from "./models/task.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors({
    origin: 'https://collaborative-task-manager-zeta.vercel.app',
    credentials: true
}));
app.use(express.json());

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Error:", err));

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: String
});

const User = mongoose.model("User", userSchema);

app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid password" });

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            "mySecretKey",
            { expiresIn: "1d" }
        );

        res.json({ token, role: user.role });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/", (req, res) => {
    res.send("API is running");
});

app.get("/users", async (req, res) => {
    try {
        const users = await User.find({}, "name email role");
        res.json(users);
    } catch (err) {
        console.error("Fetch users error:", err);
        res.status(500).json({ message: "Error fetching users" });
    }
});

app.post("/users-send", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();
        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (err) {
        console.error("Create user error:", err);
        res.status(500).json({ message: "Error creating user" });
    }
});

// ******************** admin fetch **********************
app.get("/tasks", async (req, res) => {
    try {
        const { status, assignedTo, createdBy } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (assignedTo) filter.assignedTo = assignedTo;
        if (createdBy) filter.createdBy = createdBy;

        const tasks = await Task.find(filter);
        res.json(tasks);
    } catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ message: "Error fetching tasks" });
    }
});


app.post("/tasks-send", async (req, res) => {
    try {
        const { title, description, assignedTo, createdBy, status } = req.body;

        const task = new Task({
            title,
            description,
            assignedTo,
            createdBy,
            status,
        });

        await task.save();
        res.status(201).json(task);
    } catch (err) {
        console.error("Create error:", err);
        res.status(500).json({ message: "Error creating task" });
    }
});


app.delete("/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: "Task deleted" });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ message: "Error deleting task" });
    }
});

// *********************** Member task ***********************
app.put("/tasks/:id", async (req, res) => {
    try {
        const { status } = req.body;

        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const isOwner = task.assignedTo === user.name;
        const isPrivileged = user.role === "Admin" || user.role === "Manager";

        if (!isOwner && !isPrivileged) {
            return res.status(403).json({ message: "Not authorized to update this task" });
        }

        task.status = status;
        await task.save();

        res.json({ message: "Task status updated", task });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ message: "Error updating task" });
    }
});


app.get("/tasks-member", async (req, res) => {
    const { assignedTo } = req.query;

    if (!assignedTo) {
        return res.status(400).json({ message: "assignedTo email is required" });
    }

    try {
        const user = await User.findOne({ email: assignedTo });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const rawUser = user.toObject();

        const tasks = await Task.find({ assignedTo: rawUser.name })
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");

        res.json(tasks);
    } catch (err) {
        console.error("Error fetching member tasks:", err);
        res.status(500).json({ message: "Server error" });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
