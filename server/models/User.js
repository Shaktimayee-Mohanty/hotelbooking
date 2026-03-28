import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    username: { type: String, default: "Anonymous" },
    email:{ type: String, required: true },
    image: { type: String, default: "" },
    role: { type: String, enum: ["user", "hotelOwner"], default: "user" },
    recentSearchedCities: { type: [String], default: [] },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;