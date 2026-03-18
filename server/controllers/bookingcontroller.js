import Booking from "../models/Booking.js";
import Room from "../models/Room.js";

const checkAvailability = async ({checkInDate, checkOutDate, room}) => {
    try{
        const bookings = await Booking.find({
            room,
            checkInDate: { $lte: checkOutDate },
            checkOutDate: { $gte: checkInDate },
        });
        const isAvailable = bookings.length === 0;
        return isAvailable;
    
    }catch (error) {
        console.error("Error checking availability:", error);
    }
}

//api to check availability of a room for given check-in and check-out dates
//Post /api/rooms/check-availability
export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { checkInDate, checkOutDate, room } = req.body;
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
        res.json({success:true, isAvailable });
    } catch (error) {
        res.json({ success:false,message:"Internal server error" });
        }
}

//api to create a new boking
//post /api/bookings/book
export const createBooking = async (req, res) => {
    try {
      const { room, checkInDate, checkOutDate, guests } = req.body;
      const user=req.user._id;

      //before booking check availAability
        const isAvailable = await checkAvailability({ checkInDate, 
            checkOutDate,
             room
             });
             if (!isAvailable) {
                return res.json({ success:false,message:"Room is not available for the selected dates" });
             }
              //get room price
              const roomData = await Room.findById(room).populate("hotel");
              let totalPrice = roomData.pricePerNight;
                const checkIn = new Date(checkInDate);
                const checkOut = new Date(checkOutDate);
                const timeDiff = Math.abs(checkOut.getTime() - checkIn.getTime());
                const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                totalPrice = totalPrice * diffDays;
                const booking = await Booking.create({
                    user,
                    room,
                    hotel: roomData.hotel._id,
                    guests:+guests,
                    checkInDate,
                    checkOutDate,
                    guests,
                    totalPrice
                });
                res.json({ success:true, message:"Booking created successfully" });
            } catch (error) {
                console.error("Error creating booking:", error);
        res.json({ success:false,message:"Failed to create booking" });
    }
};

//Api to get all bookings of a user
//get /api/bookings/mybookings
export const getUserBookings = async (req, res) => {
    try{
        const user=req.user._id;
        const bookings = (await Booking.find({ user }).populate("room hotel")).sort({createdAt:-1})
        res.json({ success:true, bookings });
    } catch (error) {
         res.json({ success:false,message:"Failed to fetch bookings" });
    }
}


export const getHotelBookings = async (req, res) => {
    try{
        const hotel= await Hotel.findOne({owner:req.auth.userId});
    if(!hotel){
        return res.json({ success:false,message:"Hotel not found" });
    }
    const bookings = await Booking.find({ hotel: hotel._id }).populate("user room hotel").sort({createdAt:-1});
    //total bookings
    const totalBookings = bookings.length;
    //total earnings
    const totalEarnings = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0)
    res.json({ success:true, dashboardData:{ totalBookings, totalEarnings, bookings }});

    }catch (error) {
        res.json({ success:false,message:"Failed to fetch bookings" });
    }
}
