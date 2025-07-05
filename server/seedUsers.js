import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { User } from "./models/user.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected...");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const seedUsers = async () => {
  await connectDB();

  await User.deleteMany({});

  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = [
    {
      name: "Alice Admin",
      email: "alice@admin.com",
      password: hashedPassword,
      role: "Admin",
    },
    {
      name: "Mike Manager",
      email: "mike@manager.com",
      password: hashedPassword,
      role: "Manager",
    },

    {
      name: "Maya Member",
      email: "maya@member.com",
      password: hashedPassword,
      role: "Member",
    },
    {
      name: "John Member",
      email: "john@member.com",
      password: hashedPassword,
      role: "Member",
    },
    {
      name: "Sara Member",
      email: "sara@member.com",
      password: hashedPassword,
      role: "Member",
    },
    {
      name: "Liam Member",
      email: "liam@member.com",
      password: hashedPassword,
      role: "Member",
    },
    {
      name: "Zara Member",
      email: "zara@member.com",
      password: hashedPassword,
      role: "Member",
    },
  ];

  try {
    await User.insertMany(users);
    console.log("🎉 Demo users (Admin, Manager, Members) inserted successfully.");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

seedUsers();
