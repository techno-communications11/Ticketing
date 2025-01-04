import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Col, Row, Card } from 'react-bootstrap';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { animateValue } from '../universalComponents/AnnimationCount';
import { apiRequest } from '../lib/apiRequest';
import '../styles/loader.css';
import { useMyContext } from '../universalComponents/MyContext';
import { json, useNavigate } from 'react-router-dom';
import DateRangeFilter from '../universalComponents/DateRangeFilter';

ChartJS.register(ArcElement, Tooltip, Legend);

export function SuperAdminHome() {
  const [ticketCounts, setTicketCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { setStatusId, setNtid, setDataDates } = useMyContext(); // Using context methods
  const navigate = useNavigate();

  // Local state for managing startDate and endDate
  const [dates, setDates] = useState({ startDate: '', endDate: '' });

  // Fetch ticket counts with optional date range filter
  const fetchStatusTickets = useCallback(async () => {
    const { startDate, endDate } = dates; // Get current dates
    const params = {
      startDate,
      endDate,
    };
    try {
      setLoading(true);
      const response = await apiRequest.get('/createTickets/ticketcount', { params });
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
      setLoading(false);
    }
  }, [dates]);

  useEffect(() => {
    fetchStatusTickets();
  }, [fetchStatusTickets]);

  useEffect(() => {
    Object.entries(ticketCounts).forEach(([key, value]) => {
      const element = document.getElementById(`${key}Tickets`);
      if (element) animateValue(element, 0, value, 500);
    });
  }, [ticketCounts]);

  const safeNumber = (value) => (isNaN(value) ? 0 : value);

  // This function is called when dates are updated in the DateRangeFilter
  const handleDataFromChild = (startDate, endDate) => {
    setDates({ startDate, endDate });
  };

  const filteredInsights = useMemo(() => {
    return Object.entries(ticketCounts)
      .filter(([key]) => key !== 'total');
  }, [ticketCounts]);

  const chartData = useMemo(() => {
    return {
      labels: filteredInsights.map(([key]) => key),
      datasets: [
        {
          data: filteredInsights.map(([, value]) => value),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#5b66FF'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#5b66FF'],
        },
      ],
    };
  }, [filteredInsights]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Ticket Counts by Status',
        },
      },
    };
  }, []);

  // Handle status selection and updating context with data
  const handleSperAdminStats = useCallback((statusId) => {
    const statusMap = {
      Total: '0',
      New: '1',
      Opened: '2',
      Inprogress: '3',
      Completed: '4',
      Reopened: '5',
    };

    statusId = statusMap[statusId] || '0';
    if (statusId) {
      
      setStatusId(statusId); // Update statusId in context
      localStorage.setItem("statusId", statusId);
      setNtid(null); // Reset NTID in context
      setDataDates(dates); // Update dataDates in context
      localStorage.setItem('dates', JSON.stringify(dates));
      localStorage.removeItem('adminntid');
      navigate('/totalusertickets');
    }
  }, [setStatusId, setNtid, setDataDates, navigate, dates]);

  return (
    <Container className="mt-4">
      {loading ? (
        <div className="loader d-flex align-items-center justify-content-center max-vh-100">
          {/* Loading Spinner */}
        </div>
      ) : (
        <div>
          <Row>
            <Col md={12} className="text-center mb-4">
              <h4 className="font-family" style={{ color: '#E10174' }}>Ticket Status Overview</h4>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col xs={12} md={6} lg={6} className="mb-4">
              <Row className="mb-5">
                <DateRangeFilter sendDatesToParent={handleDataFromChild} />
              </Row>
              <Row className="justify-content-center">
                {Object.entries(ticketCounts).map(([key, value]) => (
                  <Col xs={12} sm={6} md={6} lg={4} key={key} className="mb-3">
                    <Card className="shadow-sm text-center p-3 h-100 rounded" style={{ cursor: 'pointer', fontWeight: '800' }} onClick={() => handleSperAdminStats(key.charAt(0).toUpperCase() + key.slice(1))}>
                      <h5 className="font-family">{key.charAt(0).toUpperCase() + key.slice(1)}</h5>
                      <p id={`${key}Tickets`} style={{ color: '#E10174', fontSize: '40px', fontWeight: 'bold' }}>
                        {safeNumber(value)}
                      </p>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>

            <Col xs={12} md={6} lg={6} className="mb-4">
              <Card className="shadow-sm p-4 rounded" style={{ height: '68vh' }}>
                <Pie data={chartData} options={chartOptions} />
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {error && <p className="text-danger text-center">{error}</p>}
    </Container>
  );
}
