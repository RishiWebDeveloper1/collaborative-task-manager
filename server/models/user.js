import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["Admin", "Manager", "Member"],
    default: "Member",
  },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);