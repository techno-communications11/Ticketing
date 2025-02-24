import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../lib/apiRequest';

// Async thunk to fetch tickets
export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (market) => {
    const response = await apiRequest.get(`/createTickets/detailedTickets`, {
      params: { market },
    });

    // Sort tickets by createdAt date in descending order
    const sortedTickets = response.data.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return sortedTickets;
  }
);

// Create the ticket slice
const ticketSlice = createSlice({
  name: 'tickets',
  initialState: {
    tickets: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Reducer to delete a ticket from the state
    deleteTicket: (state, action) => {
      const ticketId = action.payload;
      state.tickets = state.tickets.filter((ticket) => ticket.ticketId !== ticketId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.tickets = action.payload;
        state.loading = false;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});

// Export the deleteTicket action
export const { deleteTicket } = ticketSlice.actions;

// Export the reducer
export default ticketSlice.reducer;