import Hotel from "../models/Hotel.js";
import User from "../models/User.js";


export const registerHotel = async (req, res) => {
    try {
        const { name, address, contact, city } = req.body;
        const owner = req.user._id

        //check if the user already resigtered 
        const hotel = await Hotel.findOne({ owner })
        if (hotel) {
            return res.status(400).json({ success: false, message: "You have already registered a hotel" })
        }
        await Hotel.create({ name, address, contact, city, owner });
        req.user.role = "hotelowner";
        await req.user.save();
        res.status(201).json({ success: true, message: "Hotel registered successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
