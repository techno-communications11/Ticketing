import React, { useEffect, useState, useMemo } from 'react';
import { apiRequest } from '../lib/apiRequest';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setId, fetchIndividualTickets } from '../redux/marketSlice';
import PageCountStack from '../universalComponents/PageCountStack';
import '../styles/loader.css';
import { Container, Row, Col } from 'react-bootstrap';
import { fetchStatusWiseTickets, setMarketAndStatus } from '../redux/statusSlice';
import Filtering from '../universalComponents/Filtering';
import FilterLogic from '../universalComponents/FilteringLogic';
import getDecodedToken from '../universalComponents/decodeToken';
import TicketBody from '../universalComponents/TicketBody';

function TotalUserTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [ntidFilter, setntidFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const dispatch = useDispatch();
  const { ntid } = getDecodedToken();

  useEffect(() => {
    const fetchUserTickets = async () => {
      setLoading(true);
      try {
        const response = await apiRequest.get(`/createTickets/getmarkettickets?ntid=${ntid}`);
        setTickets(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
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
  }, [ntid]);


  let market = [...new Set(tickets.map(ticket => ticket.market))];
  const filteredTickets = FilterLogic(tickets, ntidFilter, dateFilter, statusFilter)
  const currentItems = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  const counts = {};
  tickets.forEach((ticket) => {
    const statusName = ticket.status.name;
    if (counts[statusName]) {
      counts[statusName] += 1;
    } else {
      counts[statusName] = 1;
    }
  });

  const handleStatusClick = (statusName) => {
    let statusId =
      statusName === 'new' ? '1' :
        statusName === 'opened' ? '2' :
          statusName === 'inprogress' ? '3' :
            statusName === 'completed' ? '4' :
              statusName === 'reopened' ? '5' : statusName === 'Total' ? '0' : '';

    localStorage.setItem('marketData', market);
    localStorage.setItem('statusData', statusId);
    dispatch(fetchStatusWiseTickets({ market, statusId }));
    dispatch(setMarketAndStatus({ market, statusId }));
  };

  if (loading) return <div className='loader'></div>;

  return (
    <Container className='mt-0'>
      <Row className="d-flex justify-content-center gap-2  my-2">
        <Col xs={12} lg={1} className='card text-center shadow-sm rounded p-1'>
          <Link to={"/opened"} onClick={() => handleStatusClick('Total')} className='text-decoration-none fw-medium text-black'>
            <h4>Total</h4>
            <h1 style={{ color: '#E10174' }}>{tickets.length || 0}</h1>
          </Link>
        </Col>

        {Object.entries(counts).map(([statusName, count], index) => (
          <Col key={index} xs={12} lg={2} className='card text-center shadow-sm p-1 rounded'>
            <Link to={"/opened"} onClick={() => handleStatusClick(statusName)} className='text-decoration-none fw-medium text-black'>
              <h4>{statusName || 0}</h4>
              <h1 style={{ color: '#E10174' }}>{count}</h1>
            </Link>
          </Col>
        ))}
      </Row>
      <h3 className='mt-1 d-flex justify-content-center text-capitalize fw-medium mb-3' style={{ color: '#E10174' }}>
        Total Market Tickets
      </h3>
      <Row className='me-3 mb-1'>
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
        <Row className="table-responsive container">
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                {['SC.No', 'NTID', 'Full Name', 'Status', 'CreatedAt', 'CompletedAt', 'Duration', 'Details'].map((header) => (
                  <th key={header} className='text-center' style={{ backgroundColor: '#E10174', color: 'white' }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((ticket, index) => (
                <TicketBody ticket={ticket}
                index={index} 
                handleTicket={handleTicket}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}/>
              ))}
            </tbody>
          </table>
          <PageCountStack
            filteredTickets={filteredTickets}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
        </Row>
      )}
    </Container>
  );
}

export default TotalUserTickets;  
