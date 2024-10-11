import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../lib/apiRequest';

export const fetchStatusTickets = createAsyncThunk(
  'statusTickets/fetchstatusTickets',
  async ({ statusId }) => {
    console.log("data", statusId);
    const response = await apiRequest.get('/createTickets/userandstatus', {
      params: { statusId }, // Correctly pass statusId as a query parameter
    });
    return response.data;
  }
);

const userStatusSlice = createSlice({
  name: 'userTickets',
  initialState: {
    selectedStatus: '', 
    statustickets: [], 
    loading: false,
    error: null,
  },
  reducers: {
    setUserAndStatus: (state, action) => {
      const { statusId } = action.payload;
      state.selectedStatus = statusId;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatusTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatusTickets.fulfilled, (state, action) => {
        state.statustickets = action.payload;
        state.loading = false;
      })
      .addCase(fetchStatusTickets.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});


export const { setUserAndStatus } = userStatusSlice.actions;
export default userStatusSlice.reducer;
