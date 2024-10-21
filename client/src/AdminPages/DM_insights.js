import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/apiRequest';
import { Form } from 'react-bootstrap';
import { MdFilterList } from 'react-icons/md';
import PageCountStack from '../universalComponents/PageCountStack';
import '../styles/TicketTable.css';

function DM_insights() {
  const [dmInsights, setDmInsights] = useState(null);
  const [filteredInsights, setFilteredInsights] = useState(null);
  const [filter, setFilter] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await apiRequest.get('/createTickets/dminsights');
        setDmInsights(response.data);
        setFilteredInsights(response.data);
      } catch (error) {
        console.error('Error fetching DM insights:', error);
      }
    };

    fetchInsights();
  }, []);

  const handleFilterChange = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setFilter(searchTerm);
    const filteredData = Object.keys(dmInsights).reduce((acc, dm) => {
      if (dm.toLowerCase().includes(searchTerm)) {
        acc[dm] = dmInsights[dm];
      }
      return acc;
    }, {});

    setFilteredInsights(filteredData);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const totalItems = filteredInsights ? Object.keys(filteredInsights).length : 0;
  const currentItems = filteredInsights ? Object.keys(filteredInsights).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : [];

  return (
    <div className='container-fluid'>
      <h3 className='text-center' style={{ color: '#E10174' }}>DM's Tickets Insights</h3>
      {filteredInsights ? (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="thead-dark">
              <tr className='tablerow'>
                <th>
                  DM_Name
                  <MdFilterList
                    className="ms-2"
                    onClick={() => setIsFilterVisible(!isFilterVisible)}
                    style={{ cursor: 'pointer', fontSize: '20px' }}
                  />
                  {isFilterVisible && (
                    <Form.Control
                      type="text"
                      placeholder="Filter by DM Name"
                      value={filter}
                      onChange={handleFilterChange}
                      className="mt-1"
                    />
                  )}
                </th>
                <th>Total</th>
                <th>Opened</th>
                <th>InProgress</th>
                <th>Reopened</th>
                <th>Completed</th>
                <th>Request Reopen</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(dm => (
                <tr key={dm} className='tablerow'>
                  <td className='text-centre'>{dm}</td>
                  <td className='text-centre'>{filteredInsights[dm].totalTickets}</td>
                  <td className='text-centre'>{filteredInsights[dm].opened || 0}</td>
                  <td className='text-centre'>{filteredInsights[dm].inProgress || 0}</td>
                  <td className='text-centre'>{filteredInsights[dm].reopened || 0}</td>
                  <td className='text-centre'>{filteredInsights[dm].completed || 0}</td>
                  <td className='text-centre'>{filteredInsights[dm].requestReopenCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Component */}
          <PageCountStack
            filteredTickets={currentItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default DM_insights;
