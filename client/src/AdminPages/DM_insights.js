import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/apiRequest';
import { Form } from 'react-bootstrap';
import { MdFilterList } from 'react-icons/md';
import PageCountStack from '../universalComponents/PageCountStack';
import '../styles/TicketTable.css';
import { useNavigate } from 'react-router-dom';
import { useMyContext } from '../universalComponents/MyContext';
import * as XLSX from 'xlsx';
import { MdDownload } from 'react-icons/md';

function DM_insights() {
  const [dmInsights, setDmInsights] = useState(null);
  const [filteredInsights, setFilteredInsights] = useState(null);
  const [filter, setFilter] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const navigate = useNavigate();
  const { setDm } = useMyContext();

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
      if (dm.toLowerCase()?.includes(searchTerm)) {
        acc[dm] = dmInsights[dm];
      }
      return acc;
    }, {});

    setFilteredInsights(filteredData);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const totalItems = filteredInsights ? Object.keys(filteredInsights).length : 0;
  const currentItems = filteredInsights ? Object.keys(filteredInsights).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : [];

  const handleDmClick = (dm) => {
    setDm(dm);
    navigate('/dmtabs');
  };

  // Excel download function
  const downloadExcel = () => {
    const data = Object.keys(filteredInsights).map(dm => {
      return {
        "DM Name": dm,
        "Total Tickets": filteredInsights[dm].totalTickets,
        "New": filteredInsights[dm].new || 0,
        "Opened": filteredInsights[dm].opened || 0,
        "In Progress": filteredInsights[dm].inProgress || 0,
        "Reopened": filteredInsights[dm].reopened || 0,
        "Completed": filteredInsights[dm].completed || 0,
        "Request Reopen": filteredInsights[dm].requestreopen || 0
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DM Insights');
    XLSX.writeFile(workbook, 'DM_Insights.xlsx');
  };

  return (
    <div className='container-fluid'>
      <h3 className='text-center'>DM's Tickets Insights</h3>
      <button onClick={downloadExcel} className="btn btn-outline-success fw-medium mb-3"><MdDownload/> Download as Excel File</button>
      {filteredInsights ? (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="thead-dark">
              <tr className='tablerow'>
                <th style={{ backgroundColor: '#E10174' }}>SINO</th>
                <th style={{ backgroundColor: '#E10174' }}>
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
                <th style={{ backgroundColor: '#E10174' }}>Total</th>
                <th style={{ backgroundColor: '#E10174' }}>New</th>
                <th style={{ backgroundColor: '#E10174' }}>Opened</th>
                <th style={{ backgroundColor: '#E10174' }}>InProgress</th>
                <th style={{ backgroundColor: '#E10174' }}>Reopened</th>
                <th style={{ backgroundColor: '#E10174' }}>Completed</th>
                <th style={{ backgroundColor: '#117a65' }}>Request_Reopen</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((dm, index) => (
                <tr key={dm} className='tablerow'>
                  <td>{index + 1}</td>
                  <td className='text-centre' onClick={() => handleDmClick(dm)} style={{ cursor: 'pointer' }}>{dm}</td>
                  <td className='text-centre'>{filteredInsights[dm].totalTickets}</td>
                  <td className='text-centre'>{filteredInsights[dm].new || 0}</td>
                  <td className='text-centre'>{filteredInsights[dm].opened || 0}</td>
                  <td className='text-centre'>{filteredInsights[dm].inProgress || 0}</td>
                  <td className='text-centre'>{filteredInsights[dm].reopened || 0}</td>
                  <td className='text-centre'>{filteredInsights[dm].completed || 0}</td>
                  <td className='text-centre'>{filteredInsights[dm].requestreopen || 0}</td>
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
