import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MdDownload, MdFilterList } from 'react-icons/md';
import * as XLSX from 'xlsx';
import { Table, Row, Col, Spinner, Form, Modal } from 'react-bootstrap';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { apiRequest } from '../lib/apiRequest';

// Register the necessary chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const DepartmentWise = () => {
  const [ticketCounts, setTicketCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showModal, setShowModal] = useState(false); 

  // Function to handle potential non-numeric values
  const safeNumber = (value) => (isNaN(value) ? 0 : value);

  // Fetch ticket counts from the API
  const fetchAllTickets = useCallback(async () => {
    setLoading(true);
    setError(''); // Reset error before fetching
    try {
      const response = await apiRequest.get('/createTickets/alldeptcounts'); // Ensure the endpoint is correct
      const ticketData = response.data; // Assuming this is where the department data resides

      if (typeof ticketData !== 'object' || !Object.keys(ticketData).length) {
        throw new Error('No ticket data received.');
      }

      // Initialize counts object
      const counts = Object.keys(ticketData).reduce((acc, department) => {
        const { total = 0, new: newTickets = 0, opened = 0, inProgress = 0, completed = 0, reopened = 0 } = ticketData[department];
        acc[department] = { total, new: newTickets, opened, inProgress, completed, reopened };
        return acc;
      }, {});

      setTicketCounts(counts);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.message || 'Failed to load ticket data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllTickets();
  }, [fetchAllTickets]);

  // Handle department click to show modal
  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department);
    setShowModal(true); 
  };

  // Download ticket counts as an Excel file
  const downloadStatus = () => {
    const dataArray = Object.entries(ticketCounts).map(([department, counts]) => ({
      Department: department,
      Total: safeNumber(counts.total),
      New: safeNumber(counts.new),
      Opened: safeNumber(counts.opened),
      InProgress: safeNumber(counts.inProgress),
      Completed: safeNumber(counts.completed),
      Reopened: safeNumber(counts.reopened),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataArray);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');
    XLSX.writeFile(workbook, 'department_ticket_counts.xlsx');
  };

  // Prepare data for the pie chart
  const pieChartData = useMemo(() => {
    if (!selectedDepartment) return { labels: [], datasets: [] };

    const counts = ticketCounts[selectedDepartment] || {};
    console.log('Counts for selected department:', counts);

    return {
      labels: ['Total', 'New', 'Opened', 'In Progress', 'Completed', 'Reopened'],
      datasets: [{
        label: 'Status Wise Tickets',
        data: [
          safeNumber(counts.total),
          safeNumber(counts.new),
          safeNumber(counts.opened),
          safeNumber(counts.inProgress),
          safeNumber(counts.completed),
          safeNumber(counts.reopened),
        ],
        backgroundColor: ['#E10179', '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'],
      }],
    };
  }, [selectedDepartment, ticketCounts]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `Status Wise Tickets for ${selectedDepartment || 'Department'}`,
      },
    },
  };

  // Filter ticket counts based on user input
  const filteredTicketCounts = Object.entries(ticketCounts).filter(([department]) =>
    department.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Row>
      {loading ? (
        <div className="loader">
          <Spinner animation="border" />
        </div>
      ) : (
        <div>
          {error && <div className="alert alert-danger">{error}</div>} {/* Display error if any */}
          <Col md={12}>
            <h4 className="d-flex justify-content-center font-family fw-medium">Department Wise Ticket Counts</h4>
            <Row className="container mt-1 mb-1 d-flex justify-content-center">
              <Col md={12} sm={12} xs={12} className="d-flex flex-wrap justify-content-start">
                <div className="d-flex flex-wrap w-100 gap-2">
                  <button className="btn btn-outline-success fw-medium" onClick={downloadStatus}>
                    <MdDownload /> Download Status Count as Excel File
                  </button>
                </div>
              </Col>
            </Row>

            <div className="container table-responsive-sm mt-2">
              <Table striped bordered hover className="table align-middle text-center">
                <thead>
                  <tr>
                    <th className="text-decoration-none fw-medium" style={{ backgroundColor: '#E10174', color: 'white' }}>
                      Department
                      <MdFilterList 
                        className="ms-2" 
                        onClick={() => setIsFilterVisible(!isFilterVisible)} 
                        style={{ cursor: 'pointer' }} 
                      />
                      {isFilterVisible && (
                        <Form.Control
                          type="text"
                          placeholder="Filter by Department"
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                          className="mt-1"
                        />
                      )}
                    </th>
                    {['Total', 'New', 'Opened', 'In Progress', 'Completed', 'Reopened'].map((status, index) => (
                      <th key={index} className="text-decoration-none fw-medium" style={{ backgroundColor: '#E10174', color: 'white' }}>{status}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTicketCounts.map(([department, counts]) => (
                    <tr key={department} onClick={() => handleDepartmentClick(department)}>
                      <td>{department}</td>
                      <td>{safeNumber(counts.total)}</td>
                      <td>{safeNumber(counts.new)}</td>
                      <td>{safeNumber(counts.opened)}</td>
                      <td>{safeNumber(counts.inProgress)}</td>
                      <td>{safeNumber(counts.completed)}</td>
                      <td>{safeNumber(counts.reopened)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Col>

          <Col md={12}>
            <div className="position-relative " style={{height:'50vh',zIndex: 1}} >
              {selectedDepartment && (
                <Pie options={chartOptions} data={pieChartData} />
              )}
            </div>
          </Col>
        </div>
      )}
    </Row>
  );
};

export default DepartmentWise;
