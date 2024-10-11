import React, { useEffect, useState, useMemo } from 'react';
import { Container, Table, Form } from 'react-bootstrap';
import { GrLinkNext } from 'react-icons/gr';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import '../styles/loader.css';
import { fetchStatusWiseTickets, setMarketAndStatus } from '../redux/statusSlice';
import { setId, fetchIndividualTickets } from '../redux/marketSlice';
import { getDuration } from '../universalComponents/getDuration';
import PageCountStack from '../universalComponents/PageCountStack';
import formatDate from '../universalComponents/FormatDate';
import FilterLogic from '../universalComponents/FilteringLogic';
import Filtering from '../universalComponents/Filtering';

const ShowTickets = () => {
  const dispatch = useDispatch();
  const [market, setMarket] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
   const[ntidFilter,setntidFilter]=useState('');

  const itemsPerPage = 8;

  const selectedMarket = useSelector(state => state.statusTickets.selectedMarket);
  const selectedStatus = useSelector(state => state.statusTickets.selectedStatus);
  const { statustickets, loading } = useSelector(state => state.statusTickets);
  const tickets = useSelector(state => state.tickets.tickets);

  const ticketArray = useMemo(() => Array.isArray(statustickets) ? statustickets : tickets, [statustickets, tickets]);

  useEffect(() => {
    const market = localStorage.getItem('marketData');
    const statusId = localStorage.getItem('statusData');

    if (market && statusId) {
      localStorage.setItem('marketData', market);
      localStorage.setItem('statusData', statusId);

      dispatch(fetchStatusWiseTickets({ market, statusId: statusId }));
      dispatch(setMarketAndStatus({ market, statusId: statusId }));
    }
  }, [selectedMarket, selectedStatus, dispatch]);

  useEffect(() => {
    if (ticketArray.length > 0) {
      setMarket(ticketArray[0]?.market?.toUpperCase() || '');
    }
  }, [ticketArray]);

  const handleTicket = (id) => {
    localStorage.setItem('selectedId', id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

 const filteredTickets = FilterLogic(ticketArray,ntidFilter,dateFilter,statusFilter)
  const currentItems = useMemo(() => {
    const sortedTickets = [...filteredTickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return  sortedTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredTickets, currentPage, itemsPerPage]);

  return (
    <Container className="mt-2">
      <div className="d-flex align-items-center mb-2">
        <h3 className="mb-0 font-family text-capitalize me-auto" style={{ color: '#E10174' }}>
          Tickets from Market {market.toLowerCase()}
        </h3>
        <Filtering
        ntidFilter={ntidFilter}
        setntidFilter={setntidFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />
      </div>

      {loading ? (
        <div className="vh-100 d-flex align-items-center justify-content-center">
          <div className="loader"></div>
        </div>
      ) : (
        <>
          <Table bordered hover responsive>
            <thead>
              <tr style={{ backgroundColor: '#E10174', color: 'white' }}>
              {['SC.No', 'NTID', 'Full Name', 'Status', 'CreatedAt', 'CompletedAt', 'Duration', 'Details'].map((header) => (
                  <th key={header} className='text-center' style={{ backgroundColor: '#E10174', color: 'white' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 && (
                currentItems.map((ticket, index) => (
                  <tr key={ticket.ticketId}>
                    <td className="text-center fw-medium">{index + 1}</td>
                    <td className="text-center fw-medium">{ticket.ntid}</td>
                    <td className="text-center fw-medium">{ticket.fullname}</td>
                    <td className="text-center fw-medium">{ticket.status.name}</td>
                    <td className='text-center fw-medium'>{formatDate(ticket.createdAt)}</td>
                    <td className='text-center fw-medium'>{ticket.completedAt ? formatDate(ticket.completedAt) : '-'}</td>
                    <td className='text-center fw-medium'>
                      {ticket.completedAt ? (
                        getDuration(ticket.createdAt, ticket.completedAt)
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="text-center fw-medium">
                      <Link to="/details">
                        <GrLinkNext onClick={() => handleTicket(ticket.ticketId)} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          <PageCountStack
            filteredTickets={filteredTickets}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </>
      )}
    </Container>
  );
}; 

export default ShowTickets;
