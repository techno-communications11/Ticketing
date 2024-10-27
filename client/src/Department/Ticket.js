import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/apiRequest';
import Filtering from '../universalComponents/Filtering';
import TicketBody from '../universalComponents/TicketBody';
import PageCountStack from '../universalComponents/PageCountStack';
import { Container, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import getDecodedToken from '../universalComponents/decodeToken';
import FilterLogic from '../universalComponents/FilteringLogic';
import { useDispatch } from 'react-redux';
import { setId, fetchIndividualTickets } from '../redux/marketSlice';
import '../styles/TicketTable.css'

function Ticket({ statusId, indifullname, onTicketData, openedby, openedbyUser, fullname, completedAt, maTickets }) {
  const [tickets, setTickets] = useState([]);
  const [ntidFilter, setntidFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const dispatch = useDispatch();

  useEffect(() => {
    const ntid = getDecodedToken()?.ntid;
    const userId = getDecodedToken()?.id;

    const fetchUserTickets = async () => {
      try {
        const response = await apiRequest.get('/createTickets/getdepartmenttickets', {
          params: { ntid, statusId }
        });

        let fetchedTickets = response.data;
        if (maTickets) {
          fetchedTickets = fetchedTickets.filter(ticket => ticket.openedBy !== null && ticket.assignToTeam !== null && ticket.status.name !== 'completed');
        }

        if (openedby === null) {
          fetchedTickets = fetchedTickets.filter(ticket => ticket.openedBy === null && ticket.assignToTeam === null && ticket.status.name !== 'completed');
          console.log(fetchedTickets, 'ddp')
        }

        if (fullname) {
          fetchedTickets = fetchedTickets.filter(ticket =>
            ticket.assignToTeam === fullname &&
            ticket.status.name === "inprogress" &&
            ticket.openedBy === null
          );
        }
        if (openedbyUser) {
          fetchedTickets = fetchedTickets.filter(ticket =>
            ticket.status.name !== "completed" &&
            ticket.openedBy === userId
          );
        }
        if (statusId === '4') {
          fetchedTickets = fetchedTickets.filter(ticket =>
            ticket.status.name === "completed" &&
            ticket.openedBy === userId
          );
        }
        if (statusId === '3') {
          if (!openedbyUser)
            fetchedTickets = fetchedTickets.filter(ticket =>
              ticket.status.name === "inprogress" &&
              ticket.openedBy === null
            );
          if (openedbyUser) {
            fetchedTickets = fetchedTickets.filter(ticket =>
              ticket.status.name !== "completed" &&
              ticket.openedBy === userId
            );
            console.log(fetchedTickets, "ppp")
          }

        }
        setTickets(fetchedTickets);

      } catch (error) {
        console.error('Failed to fetch tickets:', error);
        toast.error('Failed to fetch tickets');
      }
    };

    fetchUserTickets();
  }, [statusId, indifullname,  openedby, fullname, openedbyUser, onTicketData, completedAt]);

  const handleTicket = (id) => {
    localStorage.setItem('selectedId', id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  const filteredTickets = FilterLogic(tickets, ntidFilter, dateFilter, statusFilter);
  const currentItems = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Container className="mt-1">
      <h3 className="my-2 d-flex justify-content-center my-3" style={{ color: '#E10174' }}>Tickets</h3>
      <Row className="mx-1 mb-3">
        <Filtering
          ntidFilter={ntidFilter}
          setntidFilter={setntidFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />
      </Row>

      {/* Displaying Tickets Table */}
      {currentItems.length > 0 ? (
        <div className="table-responsive container-fluid">
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
                <TicketBody
                  key={ticket.id}
                  ticket={ticket}
                  index={index}
                  handleTicket={handleTicket}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center">No tickets found.</p>
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
