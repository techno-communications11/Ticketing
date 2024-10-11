import { setId, fetchIndividualTickets } from '../redux/marketSlice';
const handleTicket = (id,dispatch) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };
  export default handleTicket