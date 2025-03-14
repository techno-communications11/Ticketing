import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Col, Row, Card } from 'react-bootstrap';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { animateValue } from '../universalComponents/AnnimationCount';
import { apiRequest } from '../lib/apiRequest';
import '../styles/loader.css';
import '../styles/SuperAdminHome.css'; // New custom stylesheet
import { useMyContext } from '../universalComponents/MyContext';
import { useNavigate } from 'react-router-dom';
import DateRangeFilter from '../universalComponents/DateRangeFilter';

ChartJS.register(ArcElement, Tooltip, Legend);

export function SuperAdminHome() {
  const [ticketCounts, setTicketCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { setStatusId, setNtid, setDataDates } = useMyContext();
  const navigate = useNavigate();
  const [dates, setDates] = useState({ startDate: '', endDate: '' });

  const fetchStatusTickets = useCallback(async () => {
    const { startDate, endDate } = dates;
    const params = { startDate, endDate };
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

  const handleDataFromChild = (startDate, endDate) => {
    setDates({ startDate, endDate });
  };

  const filteredInsights = useMemo(() => {
    return Object.entries(ticketCounts).filter(([key]) => key !== 'total');
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
          labels: {
            font: { size: 14, family: 'Roboto' },
            color: '#42526e',
          },
        },
        title: {
          display: true,
          text: 'Ticket Counts by Status',
          font: { size: 18, family: 'Roboto', weight: '500' },
          color: '#E10174',
        },
        tooltip: {
          backgroundColor: '#E10174',
          titleFont: { family: 'Roboto' },
          bodyFont: { family: 'Roboto' },
        },
      },
    };
  }, []);

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
      setStatusId(statusId);
      localStorage.setItem('statusId', statusId);
      setNtid(null);
      setDataDates(dates);
      localStorage.setItem('dates', JSON.stringify(dates));
      localStorage.removeItem('adminntid');
      navigate('/totalusertickets');
    }
  }, [setStatusId, setNtid, setDataDates, navigate, dates]);

  return (
    <Container  className=" mt-4">
      {loading ? (
        <div className="loader-overlay">
          <div className="loader" role="status"></div>
        </div>
      ) : (
        <div>
          <Row>
            <Col md={12} className="text-center mb-4">
              <h4 className="dashboard-title">Ticket Status Overview</h4>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col xs={12} md={6} lg={6} className="mb-4">
              <Row className="mb-4">
                <DateRangeFilter sendDatesToParent={handleDataFromChild} />
              </Row>
              <Row className="justify-content-center">
                {Object.entries(ticketCounts).map(([key, value]) => (
                  <Col xs={12} sm={6} md={6} lg={4} key={key} className="mb-3">
                    <Card
                      className="ticket-card shadow-sm text-center p-3 h-100"
                      onClick={() => handleSperAdminStats(key.charAt(0).toUpperCase() + key.slice(1))}
                    >
                      <h5 className="card-title">{key.charAt(0).toUpperCase() + key.slice(1)}</h5>
                      <p id={`${key}Tickets`} className="ticket-count">
                        {safeNumber(value)}
                      </p>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>

            <Col xs={12} md={6} lg={6} style={{maxHeight:'30rem'}} className="mb-4 ms-auto" >
              <Card className="chart-card  ms-3">
                <Pie data={chartData} options={chartOptions} />
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {error && <p className="error-message text-danger text-center">{error}</p>}
    </Container>
  );
}

export default SuperAdminHome;