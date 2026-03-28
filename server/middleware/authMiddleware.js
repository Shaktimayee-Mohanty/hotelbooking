import User from "../models/User.js";
import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/clerk-sdk-node";

export const protect = async (req, res, next) => {
  try {
    const auth = getAuth(req);

    console.log("🔍 AUTH OBJECT:", auth);

    const { userId } = auth;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - no userId",
      });
    }

    let user = await User.findOne({ clerkId: userId });

    console.log("🔍 DB USER BEFORE:", user);

    // ✅ CREATE USER WITH REAL DATA FROM CLERK
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);

      user = await User.create({
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        username: clerkUser.firstName || "Anonymous",
        image: clerkUser.imageUrl || "",
        role: "user",
        recentSearchedCities: [],
      });

      console.log("✅ NEW USER CREATED WITH CLERK DATA:", user);
    }

    req.user = user;

    console.log("🔍 FINAL USER:", user);

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};