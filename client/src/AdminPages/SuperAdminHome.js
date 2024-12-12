import React, { useState, useEffect, useCallback } from 'react';
import { Container, Col, Row, Card, Spinner } from 'react-bootstrap';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { animateValue } from '../universalComponents/AnnimationCount';
import { apiRequest } from '../lib/apiRequest';
import '../styles/loader.css';
import { useMyContext } from '../universalComponents/MyContext';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

export function SuperAdminHome() {
  const [ticketCounts, setTicketCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const {setStatusId,setNtid}=useMyContext();
  const navigate=useNavigate();

  const fetchStatusTickets = useCallback(async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  }, []);

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
  const filteredInsights = Object.entries(ticketCounts)
    .filter(([key]) => key !== "total");

  const chartData = {
    labels: filteredInsights.map(([key]) => key),  // The status labels (excluding "Total")
    datasets: [
      {
        data: filteredInsights.map(([, value]) => value),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF','#5b66FF'], 
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF','#5b66FF'],
      },
    ],
  };

  const chartOptions = {
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
  const handleSperAdminStats = async (statusId) => {
    // Mapping status names to IDs
    const statusMap = {
        Total: '0',
        New: '1',
        Opened: '2',
        Inprogress: '3',
        Completed: '4',
        Reopened: '5'
    };

    // Get the corresponding status ID, defaulting to '0' if not found
    statusId = statusMap[statusId] || '0';
    if(statusId){
      localStorage.setItem('statusId',statusId)
      setStatusId(statusId)
      setNtid(null)
      navigate('/totalusertickets')
    }
};


  return (
    <Container className="mt-4">
      {loading ? (
        <div className="loader">
        </div>
      ) : (
        <div>
          <Row>
            <Col md={12} className="text-center mb-4">
              <h4 className=" font-family" style={{color:'#E10174'}}>Ticket Status Overview</h4>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col xs={12} md={6} lg={6} className="mb-4">
              <Row className="justify-content-center">
                {Object.entries(ticketCounts).map(([key, value]) => (
                  <Col xs={12} sm={6} md={6} lg={4} key={key} className="mb-3 ">
                    <Card className="shadow-sm text-center p-3 h-100 rounded " style={{cursor:'pointer',fontWeight:'800'}} onClick={()=>handleSperAdminStats(key.charAt(0).toUpperCase() + key.slice(1))}>
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
              <Card className="shadow-sm p-4 rounded " style={{height:'68vh'}}>
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
