import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../lib/apiRequest';

// Modify fetchStatusWiseTickets to handle either id or market
export const fetchStatusWiseTickets = createAsyncThunk(
  'statusTickets/fetchstatusWiseTickets',
  async ({ id, market, statusId }) => {
    console.log(id, market, statusId);
    
    // Set up the query parameters based on whether id or market is provided
    const params = id ? { id, statusId } : { market, statusId };
    
    const response = await apiRequest.get(`/createTickets/marketandstatus`, {
      params,
    });
    return response.data;
  }
);

const statusSlice = createSlice({
  name: 'statusTickets',
  initialState: {
    selectedMarket: '',
    selectedStatus: '',
    statustickets: [],
    loading: false,
    error: null,
  },
  
  reducers: {
    setMarketAndStatus: (state, action) => {
      const { market, statusId } = action.payload;
      state.selectedMarket = market;
      state.selectedStatus = statusId;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatusWiseTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatusWiseTickets.fulfilled, (state, action) => {
        state.statustickets = action.payload;
        state.loading = false;
      })
      .addCase(fetchStatusWiseTickets.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});

export const { setMarketAndStatus } = statusSlice.actions;
export default statusSlice.reducer;
