import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/apiRequest';
import { Form } from 'react-bootstrap';
import { MdFilterList } from 'react-icons/md';
import PageCountStack from '../universalComponents/PageCountStack';
import { setUserAndStatus, fetchStatusTickets } from '../redux/userStatusSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useMyContext } from '../universalComponents/MyContext';
import * as XLSX from 'xlsx'; // Import XLSX
import { MdDownload } from 'react-icons/md';

function User_insights() {
  const [userStats, setUserStats] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [ntidFilter, setNtidFilter] = useState('');
  const [isFilterVisible1, setIsFilterVisible1] = useState(false);
  const [isFilterVisible2, setIsFilterVisible2] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setNtid } = useMyContext();

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await apiRequest.get('/createTickets/userinsights');
        setUserStats(response.data);
        console.log(response.data,"dtsst")
      } catch (error) {
        console.error('Error fetching user ticket stats:', error);
      }
    };

    fetchUserStats(); // Fetch data when component mounts
  }, []);

  const filteredUserStats = userStats.filter(user =>
    user.fullname.toLowerCase()?.includes(nameFilter.toLowerCase()) &&
    user.ntid.toLowerCase()?.includes(ntidFilter.toLowerCase())
  );

  const currentItems = filteredUserStats.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const handleDataSend = (statusId, ntid) => {
    localStorage.setItem('statusData', statusId);
    dispatch(fetchStatusTickets({ statusId, ntid }));
    dispatch(setUserAndStatus({ statusId, ntid }));
    navigate("/usertickets");
  };

  const handleStatusClick = (ntid, statusId) => () => handleDataSend(statusId, ntid);
  const handleTotalTickets = (AdminsDatantid) => () => {
    console.log(AdminsDatantid, 'AdminsDatantid')
    setNtid(AdminsDatantid);
    if (AdminsDatantid) {
      navigate('/totalusertickets');
    } else {
      console.error("NTID is not available");
    }
  };

  // Function to export data to Excel
  const exportToExcel = () => {
    const data = filteredUserStats.map(user => ({
      ntid: user.ntid,
      fullName: user.fullname,
      totalTickets: user.ticketStats.totalTickets,
      new: user.ticketStats.new || 0,
      opened: user.ticketStats.opened || 0,
      inProgress: user.ticketStats.inprogress || 0,
      reopened: user.ticketStats.reopened || 0,
      completed: user.ticketStats.completed || 0,
      requestReopen: user.ticketStats.requestreopenCount || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(data); // Convert to sheet
    const wb = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(wb, ws, 'User Insights'); // Append the sheet to the workbook
    XLSX.writeFile(wb, 'User_Insights.xlsx'); // Trigger download
  };


  return (
    <div className="container">
      <h3 className='text-center' style={{ color: '#E10174' }}>Users Tickets Insights</h3>

      <button className="btn btn-outline-success fw-medium" onClick={exportToExcel}>
                    <MdDownload /> Download as Excel File
                  </button>
      {/* Button to download Excel file */}
      {/* <button className="btn btn-transparent outline-success mb-3" onClick={exportToExcel}>
        Download as Excel File
      </button> */}

      <table className="table table-bordered table-striped">
        <thead className="table-light">
          <tr className='tablerow'>
            <th>SINo</th>
            <th>
              NTID
              <MdFilterList
                className="ms-2"
                onClick={() => setIsFilterVisible1(!isFilterVisible1)}
                style={{ cursor: 'pointer', fontSize: '20px' }}
              />
              {isFilterVisible1 && (
                <Form.Control
                  type="text"
                  placeholder="Filter by NTID"
                  value={ntidFilter}
                  onChange={(e) => setNtidFilter(e.target.value)}
                  className="mt-1"
                />
              )}
            </th>
            <th>
              Fullname
              <MdFilterList
                className="ms-2"
                onClick={() => setIsFilterVisible2(!isFilterVisible2)}
                style={{ cursor: 'pointer', fontSize: '20px' }}
              />
              {isFilterVisible2 && (
                <Form.Control
                  type="text"
                  placeholder="Filter by Fullname"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="mt-1"
                />
              )}
            </th>
            <th>Total</th>
            <th>New</th>
            <th>Opened</th>
            <th>InProgress</th>
            <th>Reopened</th>
            <th>Completed</th>
            <th style={{ backgroundColor: '#117a65' }}>Request Reopen</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((user, index) => (
              <tr key={user.ntid} className='tablerow'>
                <td className='text-centre'>{index + 1}</td>
                <td className='text-centre' onClick={handleTotalTickets(user.ntid)} style={{ cursor: 'pointer' }}>{user.ntid}</td>
                <td className='text-centre text-capitalize' onClick={handleTotalTickets(user.ntid)} style={{ cursor: 'pointer' }}>{user.fullname?.toLowerCase()}</td>
                <td className='text-centre' onClick={handleTotalTickets(user.ntid)} style={{ cursor: 'pointer' }}>{user.ticketStats.totalTickets}</td>
                <td className='text-centre' onClick={handleStatusClick(user.ntid, '1')} style={{ cursor: 'pointer' }}>{user.ticketStats.new}</td>
                <td className='text-centre' onClick={handleStatusClick(user.ntid, '2')} style={{ cursor: 'pointer' }}>{user.ticketStats.opened}</td>
                <td className='text-centre' onClick={handleStatusClick(user.ntid, '3')} style={{ cursor: 'pointer' }}>{user.ticketStats.inprogress}</td>
                <td className='text-centre' onClick={handleStatusClick(user.ntid, '4')} style={{ cursor: 'pointer' }}>{user.ticketStats.completed}</td>
                <td className='text-centre' onClick={handleStatusClick(user.ntid, '5')} style={{ cursor: 'pointer' }}>{user.ticketStats.reopened}</td>
                <td className='text-centre'>{user.ticketStats.requestreopenCount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="text-center">No data found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <PageCountStack
        itemsPerPage={itemsPerPage}
        filteredTickets={filteredUserStats}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}

export default User_insights;
