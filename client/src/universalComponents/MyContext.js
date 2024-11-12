import React, { createContext, useContext, useState } from 'react';

// Create a Context
const MyContext = createContext();

// Create a Provider Component
const MyProvider = ({ children }) => {
    const [state, setState] = useState({
        department: "",
        dm: "",
        adminntid: "",
        statusId: "",
        fullname: "",
    });

    const setDepartment = (department) => setState((prev) => ({ ...prev, department }));
    const setStatusId = (statusId) => setState((prev) => ({ ...prev, statusId }));
    const setDm = (dm) => setState((prev) => ({ ...prev, dm }));
    const setNtid = (adminntid) => setState((prev) => ({ ...prev, adminntid }));
    const setFullName = (fullname) => setState((prev) => ({ ...prev, fullname }));

    return (
        <MyContext.Provider value={{ ...state, setDepartment, setDm, setNtid, setStatusId, setFullName }}>
            {children}
        </MyContext.Provider>
    );
};

// Custom hook to use the context
const useMyContext = () => {
    return useContext(MyContext);
};

// Export the provider and hook
export { MyProvider, useMyContext };
