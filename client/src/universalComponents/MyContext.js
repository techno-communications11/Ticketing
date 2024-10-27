import React, { createContext, useContext, useState } from 'react';

// Create a Context
const MyContext = createContext();

// Create a Provider Component
const MyProvider = ({ children }) => {
    const [dm, setDm] = useState("");
    const [adminntid, setNtid] = useState("");
    const [statusId, setStatusId] = useState("");
    console.log(statusId,"tharyb")      

    return (
        <MyContext.Provider value={{ dm, setDm,adminntid,setNtid,statusId,setStatusId }}>
            {children}
        </MyContext.Provider>
    );
};

// Custom hook to use the context
const useMyContext = () => {
    return useContext(MyContext);
};

// Export both the context and the provider
export { MyProvider, useMyContext };
