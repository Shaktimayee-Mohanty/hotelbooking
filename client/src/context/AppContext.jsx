import axios from "axios";
import { createContext,useContext } from "react";
import { useNavigate } from "react-router-dom";
import {useUser,useAuth} from "@clerk/clerk-react";
import {toast} from "react-hot-toast"
import { useState ,useEffect } from "react";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

 const AppContext = createContext();

 export const AppProvider = ({children}) => {

    const currency = import.meta.env.VITE_CURRENCY || "$";
    const navigate = useNavigate();
    const {user} = useUser();
    const {getToken} = useAuth()

    const [isOwner,setIsOwner] = useState(false);
    const [showHotelReg,setShowHotelReg] = useState(false);
    const [searchedCities,setSearchedCities] = useState([]);

    const fetchUser=async()=>{
        try {
            const {data} = await axios.get("/api/user",{headers:{Authorization:`Bearer ${await getToken()}`}})
            if(data.success){
                setIsOwner(data.user.role==="hotelowner")
                setSearchedCities(data.recentSearchedcities)
            }else{
                setTimeout(() => {
                    fetchUser();
                }, 5000);
            }
        } catch (error) {
           toast.error("Failed to fetch user data. Retrying...");
        }
    }
     useEffect(() => {
        if(user){
            fetchUser();
        }
    }, [user])


    const value = {
        currency,
        navigate,
        user,
        isOwner,
        setIsOwner,
        showHotelReg,
        setShowHotelReg,
        searchedCities,
        setSearchedCities,
        axios
    }
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
 }

 export const useAppContext = () => useContext(AppContext);
