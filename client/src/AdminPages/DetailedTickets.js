import React, { useEffect, useState, useRef } from 'react';
import { Container, Table, Spinner } from 'react-bootstrap'; // Use Spinner for loader
import { GrLinkNext } from 'react-icons/gr';
import '../styles/loader.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTickets } from '../redux/ticketSlice';
import { fetchIndividualTickets, setId } from '../redux/marketSlice';
import { Link } from 'react-router-dom';
import getMarkets from '../universalComponents/GetMarkets';
import { IoIosArrowDown } from "react-icons/io";
import PageCountStack from '../universalComponents/PageCountStack';
import { getDuration } from '../universalComponents/getDuration';
import formatDate from '../universalComponents/FormatDate';
import Filtering from '../universalComponents/Filtering';
import FilterLogic from '../universalComponents/FilteringLogic';

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

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

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

  const statusOptions = ['opened', 'completed', 'inprogress', 'new', 'reopened'];

  return (
    <Container className="mt-2">
      <div className="mb-2 font-family text-capitalize d-flex align-items-center" style={{ color: '#E10174' }}>
        <h3 className="me-1">Tickets from Market {market.toLowerCase()}</h3>
        <h3 className="position-relative me-auto" ref={dropdownRef}>
          <button onClick={toggleDropdown} className="border-0 bg-transparent text-primary">
            <IoIosArrowDown />
          </button>
          {dropdownVisible && (
            <div className="dropdown-menu show position-absolute" style={{ top: '90%', right: '0%', zIndex: 1 }}>
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
        <div className='d-flex align-items-center justify-content-center vh-80'>
          <Spinner animation="border" variant="primary" />
        </div>
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
                <tr key={ticket.ticketId}>
                  <td className='text-center fw-medium'>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                  <td className='text-center fw-medium'>{ticket.ntid}</td>
                  <td className='text-center fw-medium'>{ticket.fullname?.name || ticket.fullname}</td>
                  <td className='text-center fw-medium'>{ticket.status?.name || ticket.status}</td>
                  <td className='text-center fw-medium'>{formatDate(ticket.createdAt)}</td>
                  <td className='text-center fw-medium'>{ticket.completedAt ? formatDate(ticket.completedAt) : '-'}</td>
                  <td className='text-center fw-medium'>
                    {ticket.completedAt ? getDuration(ticket.createdAt, ticket.completedAt) : '-'}
                  </td>
                  <td className='text-center'>
                    <Link to='/details' className='text-primary'>
                      <GrLinkNext size={20} onClick={() => handleTicket(ticket.ticketId)} />
                    </Link>
                  </td>
                </tr>
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
