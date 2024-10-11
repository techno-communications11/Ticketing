import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Col, Row, Table, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import getMarkets from '../universalComponents/GetMarkets';
import { animateValue } from '../universalComponents/AnnimationCount';
import { apiRequest } from '../lib/apiRequest';
import { useDispatch } from 'react-redux';
import { setMarket } from '../redux/marketSlice';
import { fetchStatusWiseTickets, setMarketAndStatus } from '../redux/statusSlice';
import { MdDownload } from "react-icons/md";
import * as XLSX from 'xlsx';
import '../styles/loader.css';

export function SuperAdminHome() {
  const dispatch = useDispatch();
  const [marketData, setMarketData] = useState([]);
  const [ticketCounts, setTicketCounts] = useState({});
  const [marketTicketCounts, setMarketTicketCounts] = useState({});
  const [error, setError] = useState('');

  const fetchMarketData = useCallback(async () => {
    try {
      const data = await getMarkets();
      setMarketData(data);
    } catch (err) {
      setError('Failed to load market data.');
    } finally {
    }
  }, []);

  const fetchStatusTickets = useCallback(async () => {
    try {
      const response = await apiRequest.get('/createTickets/ticketcount');
      if (response.status === 200) {
        const counts = response.data.reduce((acc, { count, status }) => {
          acc[status] = count || 0;
          return acc;
        }, {});
        counts.total = Object.values(counts).reduce((sum, count) => sum + count, 0);
        setTicketCounts(counts);
      }
    } catch (error) {
      setError('Failed to fetch ticket counts.');
    } finally {
    }
  }, []);

  const fetchMarketWiseStatus = useCallback(async () => {
    if (marketData.length > 0) {
      try {
        const counts = await Promise.all(
          marketData.map(async (item) => {
            const response = await apiRequest.get('/createTickets/marketwisestatus', { params: { market: item.market } });
            return { market: item.market, counts: response.data };
          })
        );
        const marketTotals = counts.reduce((acc, { market, counts }) => {
          const total = Object.keys(counts)
            .filter(key => key !== 'market')
            .reduce((sum, key) => sum + (counts[key] || 0), 0);
          acc[market] = { total, ...counts };
          return acc;
        }, {});
        setMarketTicketCounts(marketTotals);
      } catch (error) {
        setError('Failed to fetch market-wise status.');
      } finally {
      }
    }
  }, [marketData]);

  useEffect(() => {
    fetchMarketData();
    fetchStatusTickets();
  }, [fetchMarketData, fetchStatusTickets]);

  useEffect(() => {
    fetchMarketWiseStatus();
  }, [marketData, fetchMarketWiseStatus]);

  useEffect(() => {
    Object.entries(ticketCounts).forEach(([key, value]) => {
      const element = document.getElementById(`${key}Tickets`);
      if (element) animateValue(element, 0, value, 500);
    });
  }, [ticketCounts]);

  const safeNumber = (value) => (isNaN(value) ? 0 : value);

  const handleMarketClick = (market) => {
    dispatch(setMarket(market));
  };

  const handleStatusClick = (market, statusId) => {
    localStorage.setItem('marketData', market);
    localStorage.setItem('statusData', statusId);
    dispatch(fetchStatusWiseTickets({ market, statusId }));
    dispatch(setMarketAndStatus({ market, statusId }));
  };

  const downloadStatus = () => {
    const dataArray = Object.entries(marketTicketCounts).map(([market, counts]) => ({
      Market: market,
      Total: safeNumber(counts.total),
      New: safeNumber(counts.new),
      Opened: safeNumber(counts.opened),
      Inprogress: safeNumber(counts.inprogress),
      Completed: safeNumber(counts.completed),
      Reopened: safeNumber(counts.reopened),
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataArray);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'market_ticket_counts.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTickets = async () => {
    try {
      const response = await apiRequest.get('/createTickets/all');
      const tickets = response.data;
      const worksheet = XLSX.utils.json_to_sheet(tickets);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'tickets.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading tickets:', error);
    }
  };

  return (
    <Container className="mt-3">
      <div>
        <Row>
          <Col md={12}>
            <h4 className="mb-4 font-family d-flex justify-content-center fw-bolder">Status Count Of Tickets</h4>
          </Col>
          <Col md={12}>
            <Row className="d-flex justify-content-center">
              {Object.entries(ticketCounts).map(([key, value]) => (
                <Col xs={12} sm={6} md={4} lg={2} key={key} className="d-flex justify-content-center">
                  <Card className="rounded border text-dark fw-bolder text-center p-2 w-100">
                    <h4 className="font-family">{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
                    <p id={`${key}Tickets`} style={{ color: '#E10174', fontSize: '60px' }}>
                      {safeNumber(value)}
                    </p>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <h4 className="mt-3 d-flex justify-content-center font-family fw-bolder">Market Wise Tickets</h4>
            <Row className="container mt-4 mb-2 d-flex justify-content-center">
              <Col md={12} sm={12} xs={12} className="constainer d-flex flex-wrap justify-content-start">
                <div className="d-flex flex-wrap w-100 gap-2">
                  <button className="btn btn-outline-success fw-bolder" onClick={downloadStatus}>
                    <MdDownload /> Download Status Count as Excel File
                  </button>
                  <button className="btn btn-outline-success fw-bolder" onClick={downloadTickets}>
                    <MdDownload /> Download Tickets as Excel File
                  </button>
                </div>
              </Col>
            </Row>
            <div className="container table-responsive-sm mt-3">
              <Table striped bordered hover className="table  align-middle text-center">
                <thead>
                  <tr>
                    {['Market', 'Total', 'New', 'Opened', 'Inprogress', 'Completed', 'Reopened'].map((header) => (
                      <th key={header} className='text-center' style={{ backgroundColor: '#E10174', color: 'white' }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(marketTicketCounts).map(([market, counts]) => (
                    <tr key={market}>
                      <td>
                        <Link to='/marketDetailedTicket' onClick={() => handleMarketClick(market)} className=' text-capitalize text-decoration-none fw-medium text-black'>
                          {market}
                        </Link>
                      </td>
                      <td >
                        <Link to='/opened' className='text-decoration-none fw-medium text-black' onClick={(e) => { e.stopPropagation(); handleStatusClick(market, '0'); }}>
                          {safeNumber(counts.total)}
                        </Link>
                      </td>
                      <td >
                        <Link to='/opened' onClick={() => handleStatusClick(market, "1")} className='text-decoration-none fw-medium text-black'>
                          {safeNumber(counts.new)}
                        </Link>
                      </td>
                      <td>
                        <Link to='/opened' onClick={() => handleStatusClick(market, "2")} className='text-decoration-none fw-medium text-black'>
                          {safeNumber(counts.opened)}
                        </Link>
                      </td>
                      <td>
                        <Link to='/opened' onClick={() => handleStatusClick(market, "3")} className='text-decoration-none fw-medium text-black'>
                          {safeNumber(counts.inprogress)}
                        </Link>
                      </td>
                      <td >
                        <Link to='/opened' onClick={() => handleStatusClick(market, "4")} className='text-decoration-none fw-medium text-black'>
                          {safeNumber(counts.completed)}
                        </Link>
                      </td>
                      <td >
                        <Link to='/opened' onClick={() => handleStatusClick(market, "5")} className='text-decoration-none fw-medium text-black'>
                          {safeNumber(counts.reopened)}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>
      </div>
    </Container>
  );
}
