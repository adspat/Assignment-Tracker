import React, { useEffect, useState } from 'react'
import { createContext } from 'react'
import axios from 'axios'
export const AppContent = createContext();
export const AppContextProvider = (props) => {

    const [isLoggedIN, setIsLoggedIN] = useState(false);
    const [user, setUser] = useState(null);
     const [loading, setLoading] = useState(true);


    const getUserData = async () => {    
      try {
          const { data } = await axios.get(
            "http://localhost:3000/user/data",
            { withCredentials: true }
          );
    
          if (data.success) {
            setUser(data.userData);
            setIsLoggedIN(true);
          } else {
            setUser(null);
            setIsLoggedIN(false);           
            console.log("Cannot get user data");
          }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }finally{
        setLoading(false);
      }
    };
    
    useEffect(() => {
      getUserData();
    }, []);

    const value = {
        isLoggedIN,setIsLoggedIN,
        user,setUser,
        getUserData,loading,
        
    }
  return (
    <AppContent.Provider value={value}>
        {props.children}
    </AppContent.Provider>
  )
}
