import React, { createContext, useContext, useState } from "react";

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
        datafullname: "",
        datastatusId: "",
        Dates:"",
    });

    const setDepartment = (department) => setState((prev) => ({ ...prev, department }));
    const setStatusId = (statusId) => setState((prev) => ({ ...prev, statusId }));
    const setDm = (dm) => setState((prev) => ({ ...prev, dm }));
    const setNtid = (adminntid) => setState((prev) => ({ ...prev, adminntid }));
    const setFullName = (fullname) => setState((prev) => ({ ...prev, fullname }));
    const setDataStatusId = (datastatusId) => setState((prev) => ({ ...prev, datastatusId }));
    const setDataFullName = (datafullname) => setState((prev) => ({ ...prev, datafullname }));
    const setDataDates = (Dates) => setState((prev) => ({ ...prev, Dates }));

  

    return (
        <MyContext.Provider
            value={{
                ...state,
                setDepartment,
                setStatusId,
                setDm,
                setNtid,
                setFullName,
                setDataStatusId,
                setDataFullName,
                setDataDates,
            }}
        >
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
