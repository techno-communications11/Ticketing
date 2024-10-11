import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../lib/apiRequest';

export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (market) => {
    const response = await apiRequest.get(`/createTickets/detailedTickets`, {
      params: { market },
    });

    const sortedTickets = response.data.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return sortedTickets;
  }
);

const ticketSlice = createSlice({
  name: 'tickets',
  initialState: {
    tickets: [],
    loading: false,
    error: null,
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

export default ticketSlice.reducer;
