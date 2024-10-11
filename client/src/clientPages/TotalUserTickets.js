import React, { useEffect, useState, useMemo } from 'react';
import { apiRequest } from '../lib/apiRequest';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setId, fetchIndividualTickets } from '../redux/marketSlice';
import PageCountStack from '../universalComponents/PageCountStack';
import Form from 'react-bootstrap/Form'; 
import '../styles/loader.css';
import decodedToken from '../universalComponents/decodeToken';
import TicketBody from '../universalComponents/TicketBody';

function TotalUserTickets() {
  const dispatch = useDispatch();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [statusFilter, setStatusFilter] = useState(''); 
  const [dateFilter, setDateFilter] = useState(''); 
  const [currentPage, setCurrentPage] = useState(1);
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

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1); 
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesStatus = statusFilter ? ticket.status.name.toLowerCase().includes(statusFilter.toLowerCase()) : true;
      const ticketDate = new Date(ticket.createdAt).toISOString().split('T')[0]; 
      const filterDate = dateFilter ? new Date(dateFilter).toISOString().split('T')[0] : null;
      const matchesDate = filterDate ? ticketDate === filterDate : true;
      return matchesStatus && matchesDate;
    });
  }, [tickets, statusFilter, dateFilter]);
  
  const currentItems = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  
  if (loading) return <div className='loader'></div>;

  return (
    <div className='container-fluid mt-1'>
      <h2 className='my-2 d-flex justify-content-center' style={{ color: '#E10174' }}>Total User Tickets</h2>
      
      <Form className="container mb-2 d-flex gap-2">
        <Form.Group controlId="statusFilter">
          <Form.Select value={statusFilter} onChange={handleFilterChange(setStatusFilter)} className='shadow-none'>
            <option value="">Select Status</option>
            <option value="New">New</option>
            <option value="opened">Opened</option>
            <option value="inprogress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="reopened">reOpened</option>
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="dateFilter">
          <Form.Control type="date" value={dateFilter} onChange={handleFilterChange(setDateFilter)} className='shadow-none' />
        </Form.Group>
      </Form>

      {/* Tickets Table */}
      {authenticated && currentItems.length > 0 ? (
        <div className="table-responsive container">
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                {['SC.No', 'NTID', 'Full Name', 'Status','CreatedAt', 'CompletedAt','Duration', 'Details'].map((header) => (
                  <th key={header} className='text-center' style={{ backgroundColor: '#E10174', color: 'white' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((ticket, index) => (
                 <TicketBody ticket={ticket} index={index} handleTicket={handleTicket}/>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className='text-center text-primary fw-bolder'>No tickets found for this NTID.</p>
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
