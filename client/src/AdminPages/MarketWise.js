import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MdDownload, MdFilterList } from 'react-icons/md'; // Import the filter icon
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import { Table, Row, Col, Spinner, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Pie } from 'react-chartjs-2'; // Import Pie chart
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import getMarkets from '../universalComponents/GetMarkets';
import { setMarket } from '../redux/marketSlice';
import { fetchStatusWiseTickets, setMarketAndStatus } from '../redux/statusSlice';
import { apiRequest } from '../lib/apiRequest';

ChartJS.register(ArcElement, Tooltip, Legend);

function MarketWise() {
  const [marketTicketCounts, setMarketTicketCounts] = useState({});
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState(''); // State for filter input
  const [isFilterVisible, setIsFilterVisible] = useState(false); // State for showing/hiding filter input
  const [selectedMarket, setSelectedMarket] = useState(null); // State for selected market
  const dispatch = useDispatch();

  const safeNumber = (value) => (isNaN(value) ? 0 : value);

  const fetchMarketData = useCallback(async () => {
    try {
      const data = await getMarkets();
      setMarketData(data);
    } catch (err) {
      setError('Failed to load market data.');
    }
  }, []);

  const fetchMarketWiseStatus = useCallback(async () => {
    if (marketData.length > 0) {
      setLoading(true);
      try {
        const counts = await Promise.all(
          marketData.map(async (item) => {
            const response = await apiRequest.get('/createTickets/marketwisestatus', { params: { market: item.market } });
            return { market: item.market, counts: response.data };
          })
        );

        const marketTotals = counts.reduce((acc, { market, counts }) => {
          const total = Object.keys(counts)
            .filter((key) => key !== 'market')
            .reduce((sum, key) => sum + (counts[key] || 0), 0);
          acc[market] = { total, ...counts };
          return acc;
        }, {});
        setMarketTicketCounts(marketTotals);
      } catch (error) {
        setError('Failed to fetch market-wise status.');
      } finally {
        setLoading(false);
      }
    }
  }, [marketData]);

  const handleMarketClick = (market) => {
    dispatch(setMarket(market));
    setSelectedMarket(market); // Set selected market for pie chart
  };

  const handleStatusClick = (market, statusId) => {
    dispatch(fetchStatusWiseTickets({ market, statusId }));
    dispatch(setMarketAndStatus({ market, statusId }));
  };

  // Download Market Status as Excel
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
    XLSX.writeFile(workbook, 'market_ticket_counts.xlsx');
  };

  // Download All Tickets as Excel
  const downloadTickets = async () => {
    try {
      const response = await apiRequest.get('/createTickets/all');
      const tickets = response.data;
      const worksheet = XLSX.utils.json_to_sheet(tickets);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');
      XLSX.writeFile(workbook, 'tickets.xlsx');
    } catch (error) {
      console.error('Error downloading tickets:', error);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  useEffect(() => {
    fetchMarketWiseStatus();
  }, [marketData, fetchMarketWiseStatus]);

  // Filtered market ticket counts
  const filteredMarketCounts = Object.entries(marketTicketCounts).filter(([market]) =>
    market.toLowerCase().includes(filter.toLowerCase())
  );

  // Automatically update selected market based on filtered data
  useEffect(() => {
    if (filteredMarketCounts.length > 0) {
      setSelectedMarket(filteredMarketCounts[0][0]); // Set to the first filtered market
    } else {
      setSelectedMarket(null); // Reset if no markets match the filter
    }
  }, [filteredMarketCounts]);

  // Pie chart data for visualizing ticket counts by market status
  const pieChartData = useMemo(() => {
    if (!selectedMarket) return { labels: [], datasets: [] };

    const counts = marketTicketCounts[selectedMarket] || {};
    const labels = ['Total','New', 'Opened', 'In Progress', 'Completed', 'Reopened'];
    const data = [
        safeNumber(counts.total),
      safeNumber(counts.new),
      safeNumber(counts.opened),
      safeNumber(counts.inprogress),
      safeNumber(counts.completed),
      safeNumber(counts.reopened),
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Status Wise Tickets',
          data,
          backgroundColor: ['#E10179','#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'],
        },
      ],
    };
  }, [selectedMarket, marketTicketCounts]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Status Wise Tickets for ' + (selectedMarket || 'Market'),
      },
    },
  };

  return (
    <Row>
      {loading ? (
        <div className="loader">
       
        </div>
      ) : (
        <div>
          <Col md={12}>
            <h4 className="d-flex justify-content-center font-family fw-medium">Market Wise Ticket Counts</h4>

            <Row className="container mt-1 mb-1 d-flex justify-content-center">
              <Col md={12} sm={12} xs={12} className="d-flex flex-wrap justify-content-start">
                <div className="d-flex flex-wrap w-100 gap-2">
                  <button className="btn btn-outline-success fw-medium" onClick={downloadStatus}>
                    <MdDownload /> Download Status Count as Excel File
                  </button>
                  <button className="btn btn-outline-success fw-medium" onClick={downloadTickets}>
                    <MdDownload /> Download Tickets as Excel File
                  </button>
                </div>
              </Col>
            </Row>

            <div className="container table-responsive-sm mt-2" style={{zindex:0}}>
              <Table striped bordered hover className="table align-middle text-center">
                <thead>
                  <tr>
                    <th className="text-decoration-none fw-medium" style={{ backgroundColor: '#E10174', color: 'white' }}>
                      Market
                      <MdFilterList 
                        className="ms-2" 
                        onClick={() => setIsFilterVisible(!isFilterVisible)} 
                        style={{ cursor: 'pointer' }} 
                      />
                      {isFilterVisible && (
                        <Form.Control
                          type="text"
                          placeholder="Filter by Market"
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                          className="mt-1"
                        />
                      )}
                    </th>
                    <th className="text-decoration-none fw-medium" style={{ backgroundColor: '#E10174', color: 'white' }}>Total</th>
                    <th className="text-decoration-none fw-medium" style={{ backgroundColor: '#E10174', color: 'white' }}>New</th>
                    <th className="text-decoration-none fw-medium" style={{ backgroundColor: '#E10174', color: 'white' }}>Opened</th>
                    <th className="text-decoration-none fw-medium" style={{ backgroundColor: '#E10174', color: 'white' }}>In Progress</th>
                    <th className="text-decoration-none fw-medium" style={{ backgroundColor: '#E10174', color: 'white' }}>Completed</th>
                    <th className="text-decoration-none fw-medium" style={{ backgroundColor: '#E10174', color: 'white' }}>Reopened</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMarketCounts.map(([market, counts]) => (
                    <tr key={market}>
                    <td>
                      <Link to="/marketDetailedTicket" onClick={() => handleMarketClick(market)} className="text-capitalize text-decoration-none fw-medium text-black">
                        {market}
                      </Link>
                    </td>
                    <td>
                      <Link to="/opened" onClick={(e) => { e.stopPropagation(); handleStatusClick(market, '0'); }} className="text-decoration-none fw-medium text-black">
                        {safeNumber(counts.total)}
                      </Link>
                    </td>
                    <td>
                      <Link to="/opened" onClick={() => handleStatusClick(market, "1")} className="text-decoration-none fw-medium text-black">
                        {safeNumber(counts.new)}
                      </Link>
                    </td>
                    <td>
                      <Link to="/opened" onClick={() => handleStatusClick(market, "2")} className="text-decoration-none fw-medium text-black">
                        {safeNumber(counts.opened)}
                      </Link>
                    </td>
                    <td>
                      <Link to="/opened" onClick={() => handleStatusClick(market, "3")} className="text-decoration-none fw-medium text-black">
                        {safeNumber(counts.inprogress)}
                      </Link>
                    </td>
                    <td>
                      <Link to="/opened" onClick={() => handleStatusClick(market, "4")} className="text-decoration-none fw-medium text-black">
                        {safeNumber(counts.completed)}
                      </Link>
                    </td>
                    <td>
                      <Link to="/opened" onClick={() => handleStatusClick(market, "5")} className="text-decoration-none fw-medium text-black">
                        {safeNumber(counts.reopened)}
                      </Link>
                    </td>
                  </tr>
                ))}
                </tbody>
              </Table>
            </div>
          </Col>

          <Col md={12}>
            <div className="position-relative " style={{height:'50vh',zIndex: 1}} >
              {selectedMarket && (
                <Pie options={chartOptions} data={pieChartData} />
              )}
            </div>
          </Col>
        </div>
      )}
    </Row>
  );
}

export default MarketWise;
