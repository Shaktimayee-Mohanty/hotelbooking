import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/Room.js";
import User from "../models/User.js";
//API to create a room for a hotel
export const createRoom = async (req, res) => {
   try {
      
      const { roomType, pricePerNight, amenities } = req.body;
       
      const user = await User.findOne({ clerkId: req.auth.userId });
      

      if (!user) {
         
         return res.json({ success: false, message: "User not found" });
      }



//  Try matching hotel
const hotel = await Hotel.findOne({ owner: user._id });


      if (!hotel) {
         return res.json({ success: false, message: "No Hotel found" });
      }
      //upload images to cloudinary and get the urls
      const uploadedImages = await Promise.all(
         req.files.map(
            (file) =>
               new Promise((resolve, reject) => {
                  const stream = cloudinary.uploader.upload_stream(
                     { folder: "hotelRooms" },
                     (error, result) => {
                        if (error) {
                           return reject(error);
                        }
                        resolve(result.secure_url);
                     }
                  );
                  stream.end(file.buffer);
               })
         )
      );

      const images = await Promise.all(uploadedImages)

      await Room.create({
         hotel: hotel._id,
         roomType,
         pricePerNight: +pricePerNight,
         amenities: JSON.parse(amenities),
         images,
      })
      res.json({ success: true, message: "Room created successfully" });
   } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
   }
}

//API to get all rooms of a hotel
export const getRooms = async (req, res) => {
   try {
      const rooms = await Room.find({ isAvailable: true }).populate({
         path: "hotel",
         populate: {
            path: "owner",
            select: 'image'
         }
      }).sort({ createdAt: -1 })
      res.json({ success: true, rooms });
   } catch (error) {
      res.json({ success: false, message: "Internal server error" });
   }
}


//API to get all rooms for a specific hotel 
export const getOwnerRooms = async (req, res) => {
   try {
 const user = await User.findOne({ clerkId: req.auth.userId });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
   const hotelData = await Hotel.findOne({owner:user._id});
   
    if (!hotelData) {
      return res.json({ success: false, message: "No Hotel found" });
    }     
     const rooms = await Room.find({ hotel: hotelData._id }).populate("hotel");
      res.json({ success: true, rooms });
   } catch (error) {
      res.json({ success: false, message: "Internal server error" });
   }
}

//API to toggle availability of a room
export const toggleRoomAvailability = async (req, res) => {
   try {
      const { roomId } = req.body;
      const roomData = await Room.findById(roomId);
      roomData.isAvailable = !roomData.isAvailable;
      await roomData.save();
      res.json({ success: true, message: "Room availability toggled successfully" });
   }
   catch (error) {
      res.json({ success: false, message: "Internal server error" });
   }
}