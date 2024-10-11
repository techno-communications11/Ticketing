import React, { useEffect, useState, useMemo } from 'react';
import { Container, Table, Form } from 'react-bootstrap';
import { GrLinkNext } from 'react-icons/gr';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import formatDate from '../universalComponents/FormatDate';
import PageCountStack from '../universalComponents/PageCountStack';
import { fetchStatusWiseTickets, setMarketAndStatus } from '../redux/statusSlice';
import { setId, fetchIndividualTickets } from '../redux/marketSlice';
import { jwtDecode } from 'jwt-decode';
import { getDuration } from '../universalComponents/getDuration';
import '../styles/TicketTable.css'

const TicketsTable = ({ statusIds }) => {
  const dispatch = useDispatch();
  const [market, setMarket] = useState('');
  const [ntidFilter, setNtidFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [combinedTickets, setCombinedTickets] = useState([]);
  const token = localStorage.getItem("token");
  const userId = jwtDecode(token);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const storedMarket = userId?.id;
    const hasFetched = localStorage.getItem("hasFetched");

    if (storedMarket && !hasFetched) {
      const fetchTickets = async () => {
        const allTickets = await Promise.all(
          statusIds.map(statusId => dispatch(fetchStatusWiseTickets({ id: storedMarket, statusId })))
        );
        const combined = allTickets.flatMap(ticket => ticket.payload || []);
        setCombinedTickets(combined);
      };

      fetchTickets();
      statusIds.forEach(statusId => dispatch(setMarketAndStatus({ id: storedMarket, statusId })));
      localStorage.setItem("hasFetched", true);
    }
  }, [dispatch, userId, statusIds]);

  useEffect(() => {
    return () => {
      localStorage.removeItem("hasFetched");
    };
  }, []);

  useEffect(() => {
    if (combinedTickets.length > 0 && combinedTickets[0]?.market) {
      setMarket(combinedTickets[0].market.toUpperCase());
    }
  }, [combinedTickets]);
  

  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  const filteredTickets = useMemo(() => {
    return combinedTickets.filter(ticket => {
      const ntidMatch = ntidFilter ? ticket.ntid?.toLowerCase().includes(ntidFilter.toLowerCase()) : true;
      const dateMatch = dateFilter ? new Date(ticket.createdAt).toISOString().split('T')[0] === new Date(dateFilter).toISOString().split('T')[0] : true;
      return ntidMatch && dateMatch;
    });
  }, [combinedTickets, ntidFilter, dateFilter]);
  

  const currentItems = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Sorting logic: completed tickets go to the end
  const completedTickets = currentItems.filter(ticket => ticket.isSettled); // completed tickets
  const nonCompletedTickets = currentItems.filter(ticket => !ticket.isSettled); // not completed tickets
  

  const sortedCompletedTickets = completedTickets.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  const finalTickets = [...nonCompletedTickets, ...sortedCompletedTickets];
  console.log(finalTickets)
  return (
    <Container className="mt-3">
      <h3 className="d-flex justify-content-center mb-2 font-family" style={{ color: '#E10174' }}>
        Tickets from Market&nbsp;
        <span>{market.charAt(0) + market.slice(1).toLowerCase()}</span>
      </h3>

      <Form className="mb-2 d-flex gap-2">
        <Form.Group controlId="ntidFilter">
          <Form.Control
            type="text"
            value={ntidFilter}
            onChange={(e) => { setNtidFilter(e.target.value); setCurrentPage(1); }}
            placeholder="Enter NTID"
            className='shadow-none'
          />
        </Form.Group>

        <Form.Group controlId="dateFilter">
          <Form.Control
            type="date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
          />
        </Form.Group>
      </Form>

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
                style={ticket.isSettled ? { color: 'lightgray' } : {}}
              >
                <td className='fw-medium'>{index + 1}</td>
                <td className='fw-medium'>{ticket.ntid}</td>
                <td className='fw-medium'>{ticket.fullname}</td>
                <td className='fw-medium'>{ticket.status.name || '-'}</td>
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


      <PageCountStack
        filteredTickets={filteredTickets}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </Container>
  );
};

export default TicketsTable;
