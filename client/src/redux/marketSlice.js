import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../lib/apiRequest';

export const fetchIndividualTickets = createAsyncThunk(
  'markets/fetchIndividualTickets',
  async (id) => {
    const response = await apiRequest.get(`/createTickets/Ticketdetails`, {
      params: { id },
    });
    return response.data;
  }
);

const marketSlice = createSlice({
  name: 'market',
  initialState: {
    selectedMarket: '',
    selectedId: '',
    markets: [], // to store fetched markets
    loading: false,
    error: null,
  },
  reducers: {
    setMarket: (state, action) => {
      state.selectedMarket = action.payload;
    },
    setId: (state, action) => {
      state.selectedId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIndividualTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIndividualTickets.fulfilled, (state, action) => {
        state.markets = action.payload; // update state with fetched markets
        state.loading = false;
      })
      .addCase(fetchIndividualTickets.rejected, (state, action) => {
        state.error = action.error.message; // store the error message
        state.loading = false;
      });
  },
});

export const { setMarket, setId } = marketSlice.actions;
export default marketSlice.reducer;
