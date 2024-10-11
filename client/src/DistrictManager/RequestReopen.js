import React, { useEffect, useState } from 'react';
import { Table,Row } from 'react-bootstrap';
import getDecodedToken from '../universalComponents/decodeToken';
import { apiRequest } from '../lib/apiRequest';
import { setId, fetchIndividualTickets } from '../redux/marketSlice';
import { GrLinkNext } from "react-icons/gr";
import { useDispatch } from 'react-redux';
import Filtering from '../universalComponents/Filtering';
import FilterLogic from '../universalComponents/FilteringLogic';
import { Link } from 'react-router-dom';
import formatDate from '../universalComponents/FormatDate';
import { getDuration } from '../universalComponents/getDuration';


function RequestReopen() {
  const dispatch = useDispatch();
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [ntidFilter, setntidFilter] = useState('');
  const [tickets, setTickets] = useState([]);
  useEffect(() => {
    const ntid = getDecodedToken()?.ntid;
    const fetchTickets = async () => {
      try {
        const response = await apiRequest.get('/createTickets/get_request_reopen_tickets', {
          params: { ntid }
        });
        setTickets(response.data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    };

    if (ntid) {
      fetchTickets();
    }
  }, []);
  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  const filteredTickets =FilterLogic(tickets,ntidFilter,dateFilter,statusFilter)
  return (
    <div className='container'>
      <h3 className='text-capitalize text-center  my-3' style={{ color: '#E10174' }}>Requested reopen Tickets</h3>
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
      <Table striped bordered hover>
        <thead>
          <tr>

            {['SC.No', 'ntid', 'Full Name', 'CreatedAt', 'CompletedAt', 'Duration', 'Details'].map((header) => (
              <th key={header} className='text-center' style={{ backgroundColor: '#E10174', color: 'white' }}>{header}</th>
            ))}
          </tr>


        </thead>
        <tbody>
          {tickets.length > 0 ? (
            tickets.map((ticket, index) => (
              <tr key={index}>
                <td className='text-center fw-medium'>{index + 1}</td>
                <td className='text-center fw-medium'>{ticket.ntid}</td>
                <td className='text-center fw-medium'>{ticket.fullname}</td>
                <td className='text-center fw-medium'>{formatDate(ticket.createdAt)}</td>
                <td className='text-center fw-medium'>{ticket.completedAt ? formatDate(ticket.completedAt) : '-'}</td>
                <td className='text-center fw-medium'>
                  {ticket.completedAt ? getDuration(ticket.createdAt, ticket.completedAt) : "-"}
                </td>
                <td className='text-center fw-medium'>
                  <Link to="/details">
                    <GrLinkNext className="fw-bolder" onClick={() => handleTicket(ticket.ticketId)} />
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">No tickets found.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default RequestReopen;
