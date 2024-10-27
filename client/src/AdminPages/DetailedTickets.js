import React, { useEffect, useState, useRef } from 'react';
import { Container, Table, Row, Col } from 'react-bootstrap';
import '../styles/loader.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTickets } from '../redux/ticketSlice';
import { fetchIndividualTickets, setId } from '../redux/marketSlice';
import getMarkets from '../universalComponents/GetMarkets';
import { IoIosArrowDown } from "react-icons/io";
import PageCountStack from '../universalComponents/PageCountStack';
import Filtering from '../universalComponents/Filtering';
import FilterLogic from '../universalComponents/FilteringLogic';
import TicketBody from '../universalComponents/TicketBody';

const ShowTickets = () => {
  const dispatch = useDispatch();
  const [marketData, setMarketData] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [market, setMarket] = useState('');
  const [ntidFilter, setntidFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const dropdownRef = useRef(null);

  const handleTicket = (id) => {
    localStorage.setItem('selectedId', id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  const selectedMarket = useSelector((state) => state.market.selectedMarket);
  const { tickets, loading } = useSelector((state) => state.tickets);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const data = await getMarkets();
        setMarketData(data);
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };
    fetchMarketData();
  }, []);

  useEffect(() => {
    const storedMarket = localStorage.getItem('marketData');
    if (storedMarket) {
      setMarket(storedMarket.toUpperCase());
      if (!selectedMarket) {
        dispatch(fetchTickets(storedMarket.toLowerCase()));
      }
    }
    if (selectedMarket) {
      localStorage.setItem('marketData', selectedMarket.toLowerCase());
      dispatch(fetchTickets(selectedMarket.toLowerCase()));
    }
  }, [selectedMarket, dispatch]);

  const filteredTickets = FilterLogic(tickets, ntidFilter, dateFilter, statusFilter);
  const currentItems = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const toggleDropdown = () => { setDropdownVisible(!dropdownVisible); };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleMarketChange = (event) => {
    const selectedMarket = event.currentTarget.getAttribute('data-value');
    setMarket(selectedMarket.toUpperCase());
    dispatch(fetchTickets(selectedMarket.toLowerCase()));
    setDropdownVisible(false);
  };

  return (
    <Container className="mt-2">
      <Row className="mb-1 font-family text-capitalize align-items-center" style={{ color: '#E10174' }}>
        <Col xs={12} md={6} className='d-flex gap-0'>
        <Col xs={11} md={9}>
          <h3>Tickets from Market {market.toLowerCase()}</h3>
        </Col>
        <Col xs={1} md={3} className="position-relative" ref={dropdownRef}>
          <button onClick={toggleDropdown} className="border-0 fs-4 right-4 bg-transparent text-primary" style={{ marginLeft: '-20px', marginBottom: '8px' }}>
          <IoIosArrowDown />
          </button>
          {dropdownVisible && (
            <div className="dropdown-menu show position-absolute" style={{ top: '90%', right: '0%', zIndex: 1,height:'50vh', overflow:'scroll' }}>
              {marketData.map((data, index) => (
                <div
                  className="dropdown-item shadow-lg text-primary fw-medium"
                  onClick={handleMarketChange}
                  style={{ cursor: "pointer" }}
                  data-value={data.market.toLowerCase()}
                  key={index}
                >
                  {data.market.toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </Col>
        </Col>
        <Col xs={12} md={6}>
          <Filtering
            ntidFilter={ntidFilter}
            setntidFilter={setntidFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
          />
        </Col>
      </Row>
      {loading ? (
        <div className='loader d-flex align-items-center justify-content-center vh-80'></div>
      ) : (
        <Table bordered hover responsive>
          <thead>
            <tr>
              {['SC.No', 'NTID', 'Full Name', 'Status', 'CreatedAt', 'CompletedAt', 'Duration', 'Details'].map((header) => (
                <th key={header} className='text-center' style={{ backgroundColor: '#E10174', color: 'white' }}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((ticket, index) => (
                <TicketBody ticket={ticket}
                  index={index}
                  handleTicket={handleTicket}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  key={ticket.TicketId} 
                />
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center fw-medium">No tickets found</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
      <PageCountStack
        filteredTickets={filteredTickets}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </Container>
  );
};

export default ShowTickets;
