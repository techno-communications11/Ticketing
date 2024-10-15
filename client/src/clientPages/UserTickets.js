import React, { useEffect, useState } from 'react';
import { GrLinkNext } from 'react-icons/gr';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container, Table, Form } from 'react-bootstrap';
import PageCountStack from '../universalComponents/PageCountStack';
import formatDate from '../universalComponents/FormatDate';
import '../styles/loader.css';
import { fetchStatusTickets, setUserAndStatus } from '../redux/userStatusSlice';
import { setId, fetchIndividualTickets } from '../redux/marketSlice';
import { getDuration } from '../universalComponents/getDuration';
const UserTickets = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDate, setFilterDate] = useState('');
  const itemsPerPage = 8;


  const selectedStatus = useSelector((state) => state.userTickets.selectedStatus || localStorage.getItem('statusData'));
  const { statustickets: userTickets, loading } = useSelector((state) => state.userTickets);
  const tickets = useSelector((state) => state.tickets.tickets);
  console.log(tickets, "tick")
  const ticketArray = Array.isArray(userTickets) ? userTickets : Array.isArray(tickets) ? tickets : [];

  useEffect(() => {
    const statusToFetch = selectedStatus || localStorage.getItem('statusData');
    if (statusToFetch) {
      localStorage.setItem('statusData', statusToFetch);
      dispatch(fetchStatusTickets({ statusId: statusToFetch }));
      dispatch(setUserAndStatus({ statusId: statusToFetch }));
    }
  }, [selectedStatus, dispatch]);

  useEffect(() => {
    if (ticketArray.length > 0) {
      localStorage.setItem('userTicketsData', JSON.stringify(ticketArray));
    }
  }, [ticketArray]);



  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  const handleDateChange = (event) => {
    setFilterDate(event.target.value);
  };

  const filteredTickets = filterDate
    ? ticketArray.filter(ticket => new Date(ticket.completedAt).toISOString().split('T')[0] === filterDate)
    : ticketArray;

  const currentItems = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const nonCompletedTickets = currentItems.filter(ticket => ticket.requestreopen);
  const completedTickets = currentItems.filter(ticket => !ticket.requestreopen);

  const sortedCompletedTickets = completedTickets.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  const finalTickets = [...nonCompletedTickets, ...sortedCompletedTickets];


  return (
    <Container className="mt-1">
      <h3 className="mb-4 font-family text-center" style={{ color: '#E10174' }}>
        {ticketArray[0]?.status.name.charAt(0).toUpperCase() + ticketArray[0]?.status.name.slice(1) || ''} Tickets
      </h3>

      <Form className="mb-2 w-25">
        <Form.Group controlId="dateFilter">
          <Form.Control
            type="date"
            value={filterDate}
            onChange={handleDateChange}
          />
        </Form.Group>
      </Form>

      {loading ? (
        <div className='vh-100 d-flex align-items-center justify-content-center'>
          <div className='loader vh-80' />
        </div>
      ) : (
        <table className='tablerow'>
          <thead>
            <tr>
              {['SC.No', 'NTID', 'Full Name', 'Status', 'CreatedAt', 'CompletedAt', 'Duration', 'Details'].map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {finalTickets.length > 0 ? (
              finalTickets.map((ticket, index) => (
                <tr
                  key={ticket.ticketId}
                  style={ticket.requestreopen ? { color: '#006A4E' } : {}}
                >
                  <td className='fw-medium'>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className='fw-medium'>{ticket.ntid}</td>
                  <td className='fw-medium'>{ticket.fullname}</td>
                  <td className='fw-medium'>{ticket.status?.name || '-'}</td>
                  <td className='fw-medium'>{formatDate(ticket.createdAt)}</td>
                  <td className='fw-medium'>
                    {ticket.completedAt ? formatDate(ticket.completedAt) : '-'}
                  </td>
                  <td className='fw-medium'>
                    {ticket.completedAt ? getDuration(ticket.createdAt, ticket.completedAt) : '-'}
                  </td>
                  <td>
                    <Link to={'/details'}>
                      <GrLinkNext className="fw-bolder" onClick={() => handleTicket(ticket.ticketId)} />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No tickets available</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <PageCountStack
        filteredTickets={filteredTickets}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </Container>
  );
};

export default UserTickets;
