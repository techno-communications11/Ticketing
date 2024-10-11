// store.js
import { configureStore } from '@reduxjs/toolkit';
import marketReducer from './marketSlice'
import ticketReducer from './ticketSlice';
import statusReducer from './statusSlice'
import userStatusReducer from './userStatusSlice'

const store = configureStore({
  reducer: {
    market: marketReducer,
    tickets: ticketReducer,
    statusTickets: statusReducer,
    userTickets: userStatusReducer, 
  },
});

export default store;
