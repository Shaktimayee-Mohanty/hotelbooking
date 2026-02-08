import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const payload = req.body.toString();
    const evt = whook.verify(payload, headers);

    const { data, type } = evt;

    if (type === "user.created") {
  try {
    console.log("CREATING USER:", data.id);

    const user = await User.create({
      clerkId: data.id,
      email: data.email_addresses[0].email_address,
      username: `${data.first_name || ""} ${data.last_name || ""}`,
      image: data.image_url,
    });

    console.log("USER SAVED:", user);
  } catch (err) {
    console.error("DB ERROR:", err.message);
  }
}

   if (type === "user.updated") {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: data.id },
      {
        email: data.email_addresses[0].email_address,
        username: `${data.first_name || ""} ${data.last_name || ""}`,
        image: data.image_url,
      },
      { new: true } // return updated doc
    );

    console.log("User updated:", updatedUser);
  } catch (err) {
    console.error("Update error:", err.message);
  }
}

    if (type === "user.deleted") {
  try {
    const deletedUser = await User.findOneAndDelete({ clerkId: data.id });
    console.log("User deleted:", deletedUser);
  } catch (err) {
    console.error("Delete error:", err.message);
  }
}
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(400).json({ success: false });
  }
};

export default clerkWebhooks;