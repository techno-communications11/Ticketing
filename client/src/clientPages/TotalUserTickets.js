import React, { useEffect, useState, useMemo } from 'react';
import { apiRequest } from '../lib/apiRequest';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setId, fetchIndividualTickets } from '../redux/marketSlice';
import PageCountStack from '../universalComponents/PageCountStack';
import '../styles/loader.css';
import decodedToken from '../universalComponents/decodeToken';
import TicketBody from '../universalComponents/TicketBody';
import Filtering from '../universalComponents/Filtering';
import { Container } from 'react-bootstrap';
import FilterLogic from '../universalComponents/FilteringLogic';

function TotalUserTickets() {
  const dispatch = useDispatch();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ntidFilter, setntidFilter] = useState('');
  const itemsPerPage = 8;

  useEffect(() => {
    const ntid = decodedToken()?.ntid;
    const fetchUserTickets = async () => {
      setLoading(true);
      try {
        const response = await apiRequest.get(`/createTickets/usertickets?ntid=${ntid}`);
        setTickets(response.data);
        setAuthenticated(true);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
        toast.error('Failed to fetch tickets');
      } finally {
        setLoading(false);
      }
    };
    if (ntid) fetchUserTickets();
    else setLoading(false);
  }, []);

  const filteredTickets = FilterLogic(tickets, ntidFilter, dateFilter, statusFilter);
  const currentItems = filteredTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };
  if (loading) return <div className='loader'></div>;

  return (
    <div className='container-fluid mt-1'>
      <h2 className='my-2 d-flex justify-content-center' style={{ color: '#E10174' }}>Total User Tickets</h2>
     <Container>
     <Filtering
        ntidFilter={ntidFilter}
        setntidFilter={setntidFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />
     </Container>
      {authenticated && currentItems.length > 0 ? (
        <div className="table-responsive container">
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                {['SC.No', 'NTID', 'Full Name', 'Status', 'CreatedAt', 'CompletedAt', 'Duration', 'Details'].map((header) => (
                  <th key={header} className='text-center' style={{ backgroundColor: '#E10174', color: 'white' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((ticket, index) => (
                <TicketBody ticket={ticket} index={index} handleTicket={handleTicket}
                  currentPage={currentPage} itemsPerPage={itemsPerPage} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className='text-center text-primary fw-medium'>No tickets found for this NTID.</p>
      )}
      <PageCountStack
        filteredTickets={filteredTickets}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}

export default TotalUserTickets;
