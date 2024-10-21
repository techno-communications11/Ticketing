import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/apiRequest';
import { Form } from 'react-bootstrap';
import { MdFilterList } from 'react-icons/md';
import PageCountStack from '../universalComponents/PageCountStack';
import '../styles/TicketTable.css'

function User_insights() {
  const [userStats, setUserStats] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [ntidFilter, setNtidFilter] = useState('');
  const [isFilterVisible1, setIsFilterVisible1] = useState(false);
  const [isFilterVisible2, setIsFilterVisible2] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await apiRequest.get('/createTickets/userinsights');
        setUserStats(response.data);
      } catch (error) {
        console.error('Error fetching user ticket stats:', error);
      }
    };

    fetchUserStats(); // Fetch data when component mounts
  }, []);

  const filteredUserStats = userStats.filter(user =>
    user.fullname.toLowerCase().includes(nameFilter.toLowerCase()) &&
    user.ntid.toLowerCase().includes(ntidFilter.toLowerCase())
  );

  const currentItems = filteredUserStats.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="container">
      <h3 className='text-center' style={{ color: '#E10174' }}>Users Tickets Insights</h3>
      <table className="table table-bordered table-striped">
        <thead className="table-light">
          <tr className='tablerow'>
            <th >SINo</th>
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
            <th>Request Reopen</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((user, index) => (
              <tr key={user.ntid} className='tablerow'>
                <td className='text-centre'>{index + 1}</td>
                <td className='text-centre'>{user.ntid}</td>
                <td className='text-centre text-capitalize'>{user.fullname?.toLowerCase()}</td>
                <td className='text-centre'>{user.ticketStats.totalTickets}</td>
                <td className='text-centre'>{user.ticketStats.new}</td>
                <td className='text-centre'>{user.ticketStats.opened}</td>
                <td className='text-centre'>{user.ticketStats.inprogress}</td>
                <td className='text-centre'>{user.ticketStats.reopened}</td>
                <td className='text-centre'>{user.ticketStats.completed}</td>
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
