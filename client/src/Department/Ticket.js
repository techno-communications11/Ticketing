import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/apiRequest';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setId, fetchIndividualTickets } from '../redux/marketSlice';
import Filtering from '../universalComponents/Filtering';
import FilterLogic from '../universalComponents/FilteringLogic';
import '../styles/loader.css';
import PageCountStack from '../universalComponents/PageCountStack';
import { Container, Row } from 'react-bootstrap';
import getDecodedToken from '../universalComponents/decodeToken';
import TicketBody from '../universalComponents/TicketBody';

function Ticket({ statusId, text, openedby, openedbyUser, fullname }) {
  const dispatch = useDispatch();
  const [tickets, setTickets] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [ntidFilter, setntidFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const ntid = getDecodedToken()?.ntid;
    const userId = getDecodedToken()?.id;
    console.log(userId, "scg")
    const fetchUserTickets = async () => {
      try {
        const response = await apiRequest.get('/createTickets/getdepartmenttickets', {
          params: { ntid, statusId }
        });
        let fetchedTickets = response.data;


        if (openedby === null) {
          fetchedTickets = fetchedTickets.filter(ticket => ticket.openedBy === null);
        }
        if (fullname) {
          fetchedTickets = fetchedTickets.filter(ticket => ticket.assignToTeam === fullname);
        }

        if (openedbyUser) {
          fetchedTickets = fetchedTickets.filter(
            ticket =>
              ticket.status.name !== "completed" &&
              ticket.openedBy === userId &&
              ticket.assignToTeam === null
          );
        }
        if (statusId == '4') {
          fetchedTickets = fetchedTickets.filter(ticket => ticket.status.name === "completed" && ticket.openedBy === userId);
        }

        setTickets(fetchedTickets);
        setAuthenticated(true);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
        toast.error('Failed to fetch tickets');
      }
    };
    fetchUserTickets();
  }, [statusId, openedby]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const filteredTickets = FilterLogic(tickets, ntidFilter, dateFilter, statusFilter);
  const currentItems = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  return (
    <Container className='mt-1'>
      <h3 className='my-2 d-flex justify-content-center my-3' style={{ color: '#E10174' }}>{text} Department Tickets</h3>
      <Row className='mx-1 mb-3'>
        <Filtering
          ntidFilter={ntidFilter}
          setntidFilter={setntidFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />
      </Row>
      {authenticated && currentItems.length > 0 && (
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
                <TicketBody ticket={ticket} index={index} handleTicket={handleTicket} />

              ))}
            </tbody>
          </table>
        </div>
      )}
      <PageCountStack
        filteredTickets={filteredTickets}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </Container>
  );
}

export default Ticket;
